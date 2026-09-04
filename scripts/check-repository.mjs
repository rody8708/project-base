// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { createHash } from 'node:crypto';
import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const approvedDigest = '9ecfbba67604bf27dcfd4812a592f7b5066aba7b1ac58bcb58dbe6c20685fd1a';
export const approvedTechnicalDigest = '85fbb1ccaaad6a987b68e09c0767bf3d3ff25cc0ec6635d2f4fd1ea5c53ea848';
const approvedTechnicalRecordDigests = Object.freeze({
  'approval-1.1.0.es-419.md': 'cb5c8a830fa599dd0128b1e290ac58a7125f0acc17ce635a97b79e54dea3e1a1',
  'approval-1.1.0.en-US.md': 'cb804779e1d4e87d94af6142d440957971b861aa44d15878f5770b530dd8c1e9',
  'candidate-1.1.0.es-419.md': 'fc16beb3213aab4f496ebdf8f29e2d13802772d350ca6e48aab467ddb31f2ff4',
  'candidate-1.1.0.en-US.md': '5e244387a73138a98855507967c7282a007eca715991bb8a2b45aa1287d00862',
  'project-foundation-1.1.0-candidate.verification.json': 'c54a6766a945ce4ce744337278fd842b3e25964eced653efa919df306c42c9a6',
});
const neutralMarkdown = new Set([
  'README.md',
  'AGENTS.md',
  '.github/CONTRIBUTING.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/SECURITY.md',
]);
const excluded = new Set(['.git', '.validation', 'output', 'artifacts', 'node_modules', 'vendor', 'dist', 'build', 'coverage', '.dart_tool', '.fvm', '.gradle', '.kotlin', '.cxx', '.phpunit.cache', 'ephemeral', '.idea', 'Pods', '.symlinks']);

export function visibleMarkdown(text) {
  return text.replace(/^```[^\r\n]*\r?\n[\s\S]*?^```[ \t]*$/gm, '');
}

export function headingIds(text) {
  const ids = new Set();
  const counts = new Map();
  for (const match of visibleMarkdown(text).matchAll(/^#{1,6} (.+)$/gm)) {
    const base = match[1].trim().toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    ids.add(count ? `${base}-${count}` : base);
  }
  return ids;
}

export function pairedPath(name) {
  if (name.endsWith('.es-419.md')) return name.replace(/\.es-419\.md$/, '.en-US.md');
  if (name.endsWith('.en-US.md')) return name.replace(/\.en-US\.md$/, '.es-419.md');
  throw new Error(`Markdown without a language suffix: ${name}`);
}

export function assertPairedDocuments(documents) {
  for (const name of documents.keys()) {
    if (neutralMarkdown.has(name)) continue;
    if (!documents.has(pairedPath(name))) throw new Error(`Missing language counterpart: ${name}`);
  }
}

export function assertPairedLinks(left, right) {
  const links = (body) => [...visibleMarkdown(body).matchAll(/\[[^\]\r\n]+\]\(<?([^)>\r\n]+)>?\)/g)]
    .map((match) => match[1].replace(/\.(es-419|en-US)\.md/g, '.locale.md'));
  if (JSON.stringify(links(left)) !== JSON.stringify(links(right))) throw new Error('Bilingual link destinations differ');
}

export async function scanMarkdown(root) {
  const documents = new Map();
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected source link: ${path.relative(root, full)}`);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const bytes = await readFile(full);
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        documents.set(path.relative(root, full).split(path.sep).join('/'), text);
      }
    }
  }
  await walk(root);
  return documents;
}

export async function checkRepository(root, { verifyRelease = true } = {}) {
  root = path.resolve(root);
  const documents = await scanMarkdown(root);
  assertPairedDocuments(documents);
  let localLinks = 0;
  for (const [name, text] of documents) {
    const visible = visibleMarkdown(text);
    if ([...visible.matchAll(/^# /gm)].length !== 1) throw new Error(`Expected one title: ${name}`);
    if (name.endsWith('.es-419.md')) assertPairedLinks(text, documents.get(pairedPath(name)));
    for (const match of visible.matchAll(/\[[^\]\r\n]+\]\(<?([^)>\r\n]+)>?\)/g)) {
      const target = match[1];
      if (/^(https?:|mailto:)/i.test(target)) continue;
      const [relative, anchor] = target.split('#', 2);
      const destination = relative ? path.resolve(root, path.dirname(name), decodeURIComponent(relative)) : path.join(root, name);
      const delta = path.relative(root, destination);
      if (delta === '..' || delta.startsWith(`..${path.sep}`) || path.isAbsolute(delta)) throw new Error(`Link leaves repository: ${name} -> ${target}`);
      try { await lstat(destination); } catch { throw new Error(`Broken link: ${name} -> ${target}`); }
      if (anchor) {
        const key = delta.split(path.sep).join('/');
        if (!documents.has(key) || !headingIds(documents.get(key)).has(decodeURIComponent(anchor))) throw new Error(`Broken anchor: ${name} -> ${target}`);
      }
      localLinks++;
    }
  }
  if (verifyRelease) {
    const archive = await readFile(path.join(root, 'releases/foundation-0.1.0-draft.4.zip'));
    if (createHash('sha256').update(archive).digest('hex') !== approvedDigest) throw new Error('Approved 1.0.0 archive changed');
    const technicalArchive = await readFile(path.join(root, 'releases/project-foundation-1.1.0-candidate.zip'));
    if (createHash('sha256').update(technicalArchive).digest('hex') !== approvedTechnicalDigest) {
      throw new Error('Approved technical 1.1.0 archive changed');
    }
    for (const [name, digest] of Object.entries(approvedTechnicalRecordDigests)) {
      const record = await readFile(path.join(root, 'releases', name));
      if (createHash('sha256').update(record).digest('hex') !== digest) {
        throw new Error(`Approved technical 1.1.0 record changed: ${name}`);
      }
    }
  }
  const neutralDocuments = [...documents.keys()].filter((name) => neutralMarkdown.has(name)).length;
  return {
    result: 'PASS', documents: documents.size, languagePairs: (documents.size - neutralDocuments) / 2,
    neutralDocuments, localLinks,
    approvedReleaseChecked: verifyRelease, approvedTechnicalReleaseChecked: verifyRelease,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await checkRepository(path.resolve(fileURLToPath(new URL('..', import.meta.url)))), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
