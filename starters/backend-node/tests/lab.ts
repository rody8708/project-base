// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { once } from 'node:events';
import { request } from 'node:https';
import type { Server } from 'node:http';
import { SqliteStore } from '../src/sqlite.js';
import { SqlStore } from '../src/sql-store.js';

export async function command(program: string, args: string[], input?: Buffer): Promise<Buffer> {
  return new Promise((yes, no) => {
    const child = spawn(program, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks: Buffer[] = []; child.stdout.on('data', data => chunks.push(Buffer.from(data)));
    child.stderr.resume(); // Never print dump contents, driver errors or credentials.
    child.on('error', () => no(new Error('Isolated lab command unavailable')));
    child.stdin.on('error', () => {});
    child.on('close', code => code === 0 ? yes(Buffer.concat(chunks)) : no(new Error('Isolated lab command failed')));
    child.stdin.end(input);
  });
}
const docker = (args: string[], input?: Buffer) => process.env.NODE_LAB_WSL
  ? command('wsl.exe', ['-d', process.env.NODE_LAB_WSL, '--', 'docker', ...args], input)
  : command('docker', args, input);
export async function lab(engine: 'sqlite' | 'postgresql' | 'mysql') {
  const folder = await mkdtemp(join(tmpdir(), 'project-base-node-lab-'));
  const containers: string[] = [], stores: (SqliteStore | SqlStore)[] = [];
  const close = async () => {
    const failures: unknown[] = [];
    for (const store of stores.reverse()) { try { await store.close(); } catch (error) { failures.push(error); } }
    for (const name of containers.reverse()) { try { await docker(['rm', '-f', name]); } catch (error) { failures.push(error); } }
    if (dirname(folder) !== resolve(tmpdir()) || !basename(folder).startsWith('project-base-node-lab-')) throw new Error('Unsafe cleanup target');
    await rm(folder, { recursive: true });
    if (failures.length) throw new Error('One or more owned lab resources could not be closed');
  };
  try {
    const openssl = process.platform === 'win32' ? 'C:/Program Files/Git/usr/bin/openssl.exe' : 'openssl';
    const key = join(folder, 'server.key'), cert = join(folder, 'server.crt');
    await command(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=IP:127.0.0.1,DNS:localhost']);
    const tls = { key: await readFile(key), cert: await readFile(cert), minVersion: 'TLSv1.2' as const };
    const csr = join(folder, 'expired.csr'), expiredCert = join(folder, 'expired.crt');
    await command(openssl, ['req', '-new', '-key', key, '-out', csr, '-subj', '/CN=localhost', '-addext', 'subjectAltName=IP:127.0.0.1,DNS:localhost']);
    await command(openssl, ['x509', '-req', '-in', csr, '-signkey', key, '-out', expiredCert, '-days', '-1', '-copy_extensions', 'copy']);
    const expiredTls = { ...tls, cert: await readFile(expiredCert) };
    async function database(label: string) {
      const path = join(folder, `${label}.sqlite`);
      if (engine === 'sqlite') {
        const store = new SqliteStore(path); stores.push(store);
        return { store, path, name: '', another: async () => { const extra = new SqliteStore(path); stores.push(extra); return extra; } };
      }
      const name = `project-base-node-test-${randomUUID()}`; containers.push(name);
      const pg = engine === 'postgresql';
      await docker(['run', '-d', '--name', name, '--label', 'project-base=node-test', '--tmpfs', pg ? '/var/lib/postgresql' : '/var/lib/mysql', '-p', `127.0.0.1::${pg ? 5432 : 3306}`,
        '-e', pg ? 'POSTGRES_PASSWORD=synthetic-lab-password' : 'MYSQL_ROOT_PASSWORD=synthetic-lab-password', '-e', pg ? 'POSTGRES_DB=lab' : 'MYSQL_DATABASE=lab', ...(pg ? [] : ['-e', 'MYSQL_ROOT_HOST=%']), pg ? 'postgres:18.6-bookworm' : 'mysql:8.4.11']);
      const port = (await docker(['port', name, pg ? '5432/tcp' : '3306/tcp'])).toString().trim().split(':').at(-1);
      const url = `${pg ? 'postgresql://postgres' : 'mysql://root'}:synthetic-lab-password@127.0.0.1:${port}/lab`;
      let ready = false;
      for (let attempt = 0; attempt < 90; attempt++) {
        try { await docker(['exec', name, ...(pg ? ['pg_isready', '-U', 'postgres', '-d', 'lab'] : ['mysql', '-uroot', '-psynthetic-lab-password', '-e', 'SELECT 1', 'lab'])]); ready = true; break; }
        catch { await new Promise(done => setTimeout(done, 1000)); }
      }
      if (!ready) throw new Error('Owned database readiness deadline exceeded');
      const another = async () => { const extra = new SqlStore(engine as 'postgresql' | 'mysql', url); stores.push(extra); return extra; };
      const store = await another(); await store.migrate(); return { store, path, name, another };
    }
    async function restore(source: Awaited<ReturnType<typeof database>>, target: Awaited<ReturnType<typeof database>>) {
      if (source.store instanceof SqliteStore) {
        // Restore only to a closed, empty, owned destination, using SQLite's native backup API.
        await target.store.close(); stores.splice(stores.indexOf(target.store), 1);
        await source.store.backupTo(target.path);
        target.store = new SqliteStore(target.path); stores.push(target.store); return;
      }
      if (engine === 'postgresql') {
        const dump = await docker(['exec', source.name, 'pg_dump', '-U', 'postgres', '-d', 'lab', '--clean', '--if-exists', '--no-owner', '--no-privileges']);
        await docker(['exec', '-i', target.name, 'psql', '-U', 'postgres', '-d', 'lab', '-v', 'ON_ERROR_STOP=1'], dump);
      } else {
        const dump = await docker(['exec', source.name, 'mysqldump', '-uroot', '-psynthetic-lab-password', '--single-transaction', '--set-gtid-purged=OFF', '--no-tablespaces', 'lab']);
        await docker(['exec', '-i', target.name, 'mysql', '-uroot', '-psynthetic-lab-password', 'lab'], dump);
      }
    }
    return { folder, tls, expiredTls, database, restore, close };
  } catch (error) { await close(); throw error; }
}
export async function listen(server: Server): Promise<number> { server.listen(0, '127.0.0.1'); await once(server, 'listening'); return (server.address() as { port: number }).port; }
export async function stop(server: Server) { server.closeAllConnections(); await new Promise<void>((yes, no) => server.close(error => error ? no(error) : yes())); }
export function call(port: number, ca: Buffer | undefined, path: string, token = '', method = 'GET', payload?: unknown, headers: Record<string, string> = {}, servername = 'localhost') {
  return new Promise<{ status: number; body: string; headers: import('node:http').IncomingHttpHeaders }>((yes, no) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, ca, servername, rejectUnauthorized: true, agent: false, headers: { Authorization: `Bearer ${token}`, ...(payload === undefined ? {} : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(payload)) }), ...headers } }, res => {
      const chunks: Buffer[] = []; res.on('data', chunk => chunks.push(Buffer.from(chunk)));
      res.on('end', () => yes({ status: res.statusCode!, body: Buffer.concat(chunks).toString(), headers: res.headers }));
    });
    req.setTimeout(5000, () => req.destroy(new Error('Lab HTTP timeout'))); req.on('error', no);
    req.end(payload === undefined ? undefined : JSON.stringify(payload));
  });
}
