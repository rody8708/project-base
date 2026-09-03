import http from 'node:http';
import path from 'node:path';
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DEFAULT_PORT = 5180;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 512;
const PUBLIC_MODULE = /^\/src\/(?:[A-Za-z0-9][A-Za-z0-9_-]*\/)*[A-Za-z0-9][A-Za-z0-9_-]*\.js$/;
const MIME = Object.freeze({ '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript; charset=utf-8' });
export const CONTENT_SECURITY_POLICY = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export class DevelopmentServerError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DevelopmentServerError';
    this.code = code;
  }
}

const failure = (code, message) => new DevelopmentServerError(code, message);
const samePath = (left, right) => process.platform === 'win32'
  ? path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase()
  : path.resolve(left) === path.resolve(right);

async function checkedDirectory(directory) {
  const absolute = path.resolve(directory);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = await fs.lstat(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw failure('UNSAFE_PUBLIC_PATH', 'Public paths must be real directories without links.');
  }
  if (!samePath(await fs.realpath(absolute), absolute)) throw failure('UNSAFE_PUBLIC_PATH', 'Public paths must not resolve through links.');
  return absolute;
}

async function checkedFile(file) {
  await checkedDirectory(path.dirname(file));
  const before = await fs.lstat(file);
  if (before.isSymbolicLink() || !before.isFile() || before.nlink !== 1) throw failure('UNSAFE_PUBLIC_PATH', 'Public files must be regular files without symbolic or hard links.');
  if (before.size > MAX_FILE_BYTES) throw failure('RESOURCE_LIMIT', 'A public file exceeds the development server size limit.');
  if (!samePath(await fs.realpath(file), file)) throw failure('UNSAFE_PUBLIC_PATH', 'Public paths must not resolve through links.');
  const handle = await fs.open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.nlink !== 1 || before.dev !== opened.dev || before.ino !== opened.ino || before.size !== opened.size) {
      throw failure('UNSAFE_PUBLIC_PATH', 'A public file changed while the snapshot was being prepared.');
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (bytes.length > MAX_FILE_BYTES || after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) {
      throw failure('UNSAFE_PUBLIC_PATH', 'A public file changed while the snapshot was being prepared.');
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

// The workspace must be trusted and unchanged during startup. These checks are
// not an OS sandbox against an attacker racing ancestor-directory replacements.
// Requests use only this bounded memory snapshot, never a request-derived path.
async function snapshotPublicFiles(root) {
  const absoluteRoot = await checkedDirectory(root);
  const files = new Map();
  let totalBytes = 0;
  async function add(relative) {
    const body = await checkedFile(path.join(absoluteRoot, ...relative.split('/')));
    totalBytes += body.length;
    if (files.size >= MAX_FILES || totalBytes > MAX_TOTAL_BYTES) throw failure('RESOURCE_LIMIT', 'The public snapshot exceeds the development server limit.');
    files.set(`/${relative}`, { body, mime: MIME[path.extname(relative)] });
  }
  for (const relative of ['index.html', 'styles.css', 'favicon.svg']) await add(relative);
  async function visit(relative, depth = 0) {
    if (depth > 16) throw failure('RESOURCE_LIMIT', 'The public directory nesting exceeds the development server limit.');
    const directory = await checkedDirectory(path.join(absoluteRoot, ...relative.split('/')));
    for (const name of (await fs.readdir(directory)).sort()) {
      const child = `${relative}/${name}`;
      const stat = await fs.lstat(path.join(directory, name));
      if (stat.isSymbolicLink()) throw failure('UNSAFE_PUBLIC_PATH', 'The public source tree must not contain links.');
      if (stat.isDirectory()) {
        if (/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) await visit(child, depth + 1);
      } else if (PUBLIC_MODULE.test(`/${child}`)) {
        await add(child);
      }
    }
  }
  await visit('src');
  if (!files.has('/src/main.js')) throw failure('MISSING_RESOURCE', 'The public module entry point is missing.');
  return files;
}

function securityHeaders(response, apiOrigin) {
  response.setHeader('Content-Security-Policy', apiOrigin ? CONTENT_SECURITY_POLICY.replace("connect-src 'none'", `connect-src ${apiOrigin}`) : CONTENT_SECURITY_POLICY);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Connection', 'close');
}

function send(response, method, status, body, type = 'text/plain; charset=utf-8') {
  response.statusCode = status;
  response.setHeader('Content-Type', type);
  response.setHeader('Content-Length', Buffer.byteLength(body));
  response.end(method === 'HEAD' ? undefined : body);
}

function headerCount(request, wanted) {
  let count = 0;
  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    if (request.rawHeaders[index].toLowerCase() === wanted) count++;
  }
  return count;
}

export function isLocalAuthority(value, port) {
  return Number.isInteger(port) && port >= 1 && port <= 65535
    && (value === `127.0.0.1:${port}` || (port === 80 && value === '127.0.0.1'));
}

export function isLocalOrigin(value, port) {
  return typeof value === 'string' && value.startsWith('http://') && isLocalAuthority(value.slice(7), port);
}

export function parseServeArguments(args) {
  if (args.length === 0) return { port: DEFAULT_PORT, help: false };
  if (args.length === 1 && args[0] === '--help') return { port: DEFAULT_PORT, help: true };
  if (args.length !== 2 || args[0] !== '--port' || !/^[1-9][0-9]{0,4}$/.test(args[1]) || Number(args[1]) > 65535) {
    throw failure('INVALID_ARGUMENTS', 'Usage: node scripts/serve.mjs [--port 1..65535] (loopback only).');
  }
  return { port: Number(args[1]), help: false };
}

export async function startDevelopmentServer({ root = DEFAULT_ROOT, port = DEFAULT_PORT, apiOrigin = process.env.FOUNDATION_API_ORIGIN || '' } = {}) {
  if (apiOrigin) {
    const url = new URL(apiOrigin);
    if (url.origin !== apiOrigin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
      throw failure('INVALID_API_ORIGIN', 'Use one explicit HTTPS or loopback API origin.');
    }
  }
  // Port zero is available only to importers for isolated ephemeral-port tests.
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw failure('INVALID_PORT', 'The port must be an integer from 0 through 65535.');
  let files;
  try {
    files = await snapshotPublicFiles(root);
  } catch (error) {
    if (error instanceof DevelopmentServerError) throw error;
    throw failure('PUBLIC_SNAPSHOT_FAILED', 'Could not prepare the public snapshot; check required files and permissions.');
  }
  let expectedHost;
  let actualPort;
  const server = http.createServer({ maxHeaderSize: 8192, requestTimeout: 5000, headersTimeout: 5000, keepAliveTimeout: 1000 }, (request, response) => {
    securityHeaders(response, apiOrigin);
    if (headerCount(request, 'host') !== 1 || !isLocalAuthority(request.headers.host, actualPort)) {
      send(response, request.method, 421, 'Unexpected Host header.\n');
      return;
    }
    if ((request.headers.origin !== undefined && (headerCount(request, 'origin') !== 1 || !isLocalOrigin(request.headers.origin, actualPort)))
      || (request.headers['sec-fetch-site'] !== undefined && !['none', 'same-origin'].includes(request.headers['sec-fetch-site']))) {
      send(response, request.method, 403, 'Cross-origin requests are not allowed.\n');
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      send(response, request.method, 405, 'Method not allowed.\n');
      return;
    }
    const target = request.url ?? '';
    const pathname = target.split('?')[0];
    // Only canonical ASCII paths are accepted; encoded and double-encoded paths
    // are rejected rather than repeatedly decoded or normalized into a match.
    if (!target.startsWith('/') || target.startsWith('//') || /[\x00-\x20\x7f\\#]/.test(target) || pathname.includes('%')) {
      send(response, request.method, 400, 'Use a canonical public URL path.\n');
      return;
    }
    const publicPath = pathname === '/' ? '/index.html' : pathname;
    if (!['/index.html', '/styles.css', '/favicon.svg'].includes(publicPath) && !PUBLIC_MODULE.test(publicPath)) {
      send(response, request.method, 404, 'Public resource not found.\n');
      return;
    }
    const resource = files.get(publicPath);
    if (!resource) {
      send(response, request.method, 404, 'Public resource not found.\n');
      return;
    }
    send(response, request.method, 200, resource.body, resource.mime);
  });
  server.maxConnections = 64;
  server.maxRequestsPerSocket = 100;
  server.on('clientError', (_error, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
    else socket.destroy();
  });
  try {
    await new Promise((resolve, reject) => {
      const onError = (error) => reject(error);
      server.once('error', onError);
      server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
        server.removeListener('error', onError);
        actualPort = server.address().port;
        expectedHost = actualPort === 80 ? '127.0.0.1' : `127.0.0.1:${actualPort}`;
        resolve();
      });
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') throw failure('PORT_IN_USE', 'The requested loopback port is already in use.');
    throw failure('LISTEN_FAILED', 'Could not listen on the requested loopback port.');
  }
  let closing;
  return Object.freeze({
    url: `http://${expectedHost}`,
    address: server.address(),
    publicFileCount: files.size,
    close() {
      closing ??= new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
      return closing;
    },
  });
}
