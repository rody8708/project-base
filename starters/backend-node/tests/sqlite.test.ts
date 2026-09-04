// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteStore } from '../src/sqlite.js';

test('file adapter rejects SQLite versions affected by the WAL reset defect before opening a file', () => {
  const descriptor = Object.getOwnPropertyDescriptor(process.versions, 'sqlite')!;
  try {
    Object.defineProperty(process.versions, 'sqlite', { ...descriptor, value: '3.50.4' });
    assert.throws(() => new SqliteStore('must-not-be-created.sqlite'), /SQLite 3.51.3/u);
    const memory = new SqliteStore(':memory:'); memory.close();
  } finally { Object.defineProperty(process.versions, 'sqlite', descriptor); }
});
test('initial migration adopts an existing synthetic SQLite schema without losing its task', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'project-base-node-migration-'));
  const path = join(folder, 'legacy.sqlite');
  try {
    const legacy = new DatabaseSync(path);
    try { legacy.exec("CREATE TABLE tasks(id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL, version INTEGER NOT NULL); INSERT INTO tasks VALUES('synthetic','owner','Preserved',0,1)"); }
    finally { legacy.close(); }
    const store = new SqliteStore(path);
    try { assert.equal(store.schemaVersion(), 1); assert.equal(store.find('owner', 'synthetic')?.title, 'Preserved'); }
    finally { store.close(); }
  } finally { await rm(folder, { recursive: true }); }
});
