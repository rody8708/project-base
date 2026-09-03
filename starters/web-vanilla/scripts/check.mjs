// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function collectJavaScript(root) {
  const files = [];
  async function visit(relative) {
    const absolute = path.join(root, relative);
    const stat = await fs.lstat(absolute);
    assert(!stat.isSymbolicLink(), `Linked source paths are not checked: ${relative}`);
    if (stat.isDirectory()) {
      for (const child of (await fs.readdir(absolute)).sort()) await visit(path.join(relative, child));
    } else if (stat.isFile() && /\.(?:js|mjs)$/.test(relative)) {
      assert(stat.nlink === 1, `Hard-linked source files are not checked: ${relative}`);
      files.push(relative);
    }
  }
  for (const directory of ['src', 'scripts', 'tests']) await visit(directory);
  return files;
}

function attributes(tag) {
  const result = new Map();
  const pattern = /([A-Za-z][A-Za-z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    assert(!result.has(name), `Duplicate HTML attribute: ${name}`);
    result.set(name, match[2] ?? match[3]);
  }
  return result;
}

export function checkHtml(html) {
  // Intentionally narrow checks for this template's hand-authored shell. This
  // is not an HTML parser, conformance validator, accessibility or SEO audit.
  const source = html.replace(/<!--[\s\S]*?-->/g, '');
  const htmlTags = source.match(/<html\b[^>]*>/gi) ?? [];
  assert(htmlTags.length === 1 && attributes(htmlTags[0]).get('lang') === 'es-419', 'HTML must declare the initial es-419 language.');
  const meta = (source.match(/<meta\b[^>]*>/gi) ?? []).map(attributes);
  assert(meta.some((entry) => entry.get('charset')?.toLowerCase() === 'utf-8'), 'HTML must declare UTF-8.');
  assert(meta.some((entry) => entry.get('name') === 'viewport' && /(?:^|,)\s*width=device-width\s*(?:,|$)/.test(entry.get('content') ?? '')), 'HTML must declare a device-width viewport.');
  const links = (source.match(/<link\b[^>]*>/gi) ?? []).map(attributes);
  const localResource = (value, expected) => value === `./${expected}` || value === `/${expected}`;
  assert(links.length === 2 && links.some((entry) => entry.get('rel') === 'stylesheet' && localResource(entry.get('href'), 'styles.css'))
    && links.some((entry) => entry.get('rel') === 'icon' && localResource(entry.get('href'), 'favicon.svg')), 'HTML must reference only the local stylesheet and favicon.');
  const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  assert((source.match(/<script\b/gi) ?? []).length === 1 && scripts.length === 1, 'HTML must contain one external module script.');
  const script = attributes(scripts[0][1]);
  assert(script.get('type') === 'module' && localResource(script.get('src'), 'src/main.js') && scripts[0][2].trim() === '', 'HTML must load src/main.js as an external module.');
  assert(!/<style\b|\sstyle\s*=|\son[a-z]+\s*=/i.test(source), 'Inline styles and event handlers are not supported by the development CSP.');
}

export function checkMessages(spanish, english) {
  function keys(value) {
    assert(value !== null && typeof value === 'object' && !Array.isArray(value), 'Locale messages must be an object.');
    const result = Object.keys(value).sort();
    assert(result.length > 0 && result.every((key) => typeof value[key] === 'string' && value[key].length > 0), 'Locale values must be nonempty strings.');
    return result;
  }
  const esKeys = keys(spanish);
  assert(JSON.stringify(esKeys) === JSON.stringify(keys(english)), 'Both locales must declare the same message keys.');
  for (const key of esKeys) {
    const placeholders = (value) => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]).sort();
    assert(JSON.stringify(placeholders(spanish[key])) === JSON.stringify(placeholders(english[key])), `Locale placeholders differ: ${key}`);
  }
  return esKeys.length;
}

export async function inspectProject(root = DEFAULT_ROOT) {
  const files = await collectJavaScript(root);
  const failures = [];
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    if (result.status !== 0 || result.error) failures.push(`JavaScript syntax check failed: ${file}`);
  }
  assert(failures.length === 0, failures.join('\n'));
  for (const file of ['index.html', 'styles.css', 'favicon.svg', 'src/main.js', 'src/i18n/es-419.js', 'src/i18n/en-US.js']) {
    const stat = await fs.lstat(path.join(root, file));
    assert(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1, `A required regular resource is missing: ${file}`);
  }
  checkHtml(await fs.readFile(path.join(root, 'index.html'), 'utf8'));
  // Like node:test, importing these local, reviewed modules executes project
  // code. This maintenance command is not a sandbox for untrusted projects.
  const nonce = `check=${Date.now()}`;
  const spanish = await import(`${pathToFileURL(path.join(root, 'src/i18n/es-419.js')).href}?${nonce}`);
  const english = await import(`${pathToFileURL(path.join(root, 'src/i18n/en-US.js')).href}?${nonce}`);
  const localeKeys = checkMessages(spanish.messages, english.messages);
  const testFiles = files.filter((file) => file.startsWith(`tests${path.sep}`) && file.endsWith('.test.js'));
  assert(testFiles.length > 0, 'At least one test file is required.');
  return { syntaxFiles: files.length, localeKeys, testFiles };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert(process.argv.length === 2, 'Usage: node scripts/check.mjs');
    const report = await inspectProject();
    process.stdout.write(`${JSON.stringify({ status: 'source-checks-passed', syntaxFiles: report.syntaxFiles, localeKeys: report.localeKeys })}\n`);
    const result = spawnSync(process.execPath, ['--test', ...report.testFiles], { cwd: DEFAULT_ROOT, stdio: 'inherit', windowsHide: true });
    process.exitCode = result.error ? 1 : (result.status ?? 1);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
