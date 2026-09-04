// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { SqliteStore } from './sqlite.js';
import { SqlStore } from './sql-store.js';

export async function openStore(environment: NodeJS.ProcessEnv = process.env) {
  const url = environment.DATABASE_URL;
  if (!url) return new SqliteStore(environment.DB_DATABASE ?? 'database.sqlite');
  const protocol = new URL(url).protocol;
  if (!['postgres:', 'postgresql:', 'mysql:'].includes(protocol)) throw new Error('Unsupported database protocol');
  const store = new SqlStore(protocol === 'mysql:' ? 'mysql' : 'postgresql', url);
  try { await store.migrate(); return store; } catch (error) { await store.close(); throw error; }
}
