// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import mysql, { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import type { Page, Permission, Principal, Task, TaskRepository, TokenRepository, RateLimitRepository } from './contracts.js';

type Row = Record<string, unknown>;
type Query = (sql: string, values?: readonly (string | number | null)[]) => Promise<{ rows: Row[]; changes: number }>;
interface Driver { query: Query; transaction<T>(work: (query: Query) => Promise<T>): Promise<T>; close(): Promise<void> }

function postgres(url: string): Driver {
  const pool = new pg.Pool({ connectionString: url, max: 12, connectionTimeoutMillis: 5000 });
  const queryFor = (client: pg.Pool | pg.PoolClient): Query => async (sql, values = []) => {
    let index = 0;
    const result = await client.query(sql.replace(/\?/gu, () => `$${++index}`), [...values]);
    return { rows: result.rows as Row[], changes: result.rowCount ?? 0 };
  };
  return { query: queryFor(pool), close: () => pool.end(), async transaction(work) {
    const client = await pool.connect(); const query = queryFor(client);
    try { await query('BEGIN'); const result = await work(query); await query('COMMIT'); return result; }
    catch (error) { await query('ROLLBACK'); throw error; } finally { client.release(); }
  } };
}

function mySql(url: string): Driver {
  const pool = mysql.createPool({ uri: url, connectionLimit: 12, connectTimeout: 5000, charset: 'utf8mb4' });
  const queryFor = (client: mysql.Pool | mysql.PoolConnection): Query => async (sql, values = []) => {
    const [result] = await client.execute<RowDataPacket[] | ResultSetHeader>(sql, [...values]);
    return Array.isArray(result) ? { rows: result as Row[], changes: 0 } : { rows: [], changes: result.affectedRows };
  };
  return { query: queryFor(pool), close: () => pool.end(), async transaction(work) {
    const client = await pool.getConnection(); const query = queryFor(client);
    try { await client.beginTransaction(); const result = await work(query); await client.commit(); return result; }
    catch (error) { await client.rollback(); throw error; } finally { client.release(); }
  } };
}

// Only this infrastructure adapter knows SQL, driver protocols and dialect differences.
export class SqlStore implements TaskRepository, TokenRepository, RateLimitRepository {
  readonly #driver: Driver;
  constructor(readonly dialect: 'postgresql' | 'mysql', url: string) { this.#driver = dialect === 'postgresql' ? postgres(url) : mySql(url); }
  async migrate(): Promise<void> {
    // Initial migration is idempotent and adopts the existing v1 schema; no data is discarded.
    const suffix = this.dialect === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin' : '';
    for (const ddl of [
      'CREATE TABLE IF NOT EXISTS tasks(id VARCHAR(36) PRIMARY KEY, owner VARCHAR(128) NOT NULL, title VARCHAR(320) NOT NULL, completed INTEGER NOT NULL, version INTEGER NOT NULL)',
      'CREATE TABLE IF NOT EXISTS api_tokens(id VARCHAR(36) PRIMARY KEY, token_hash VARCHAR(64) UNIQUE NOT NULL, subject VARCHAR(128) NOT NULL, permissions TEXT NOT NULL, expires_at BIGINT NOT NULL, revoked_at BIGINT)',
      'CREATE TABLE IF NOT EXISTS rate_limits(key_hash VARCHAR(64) NOT NULL, window_epoch BIGINT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(key_hash,window_epoch))',
      'CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY)',
    ]) await this.#driver.query(ddl + suffix);
    await this.#driver.query(this.dialect === 'postgresql'
      ? 'INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING'
      : 'INSERT INTO schema_migrations(version) VALUES(1) ON DUPLICATE KEY UPDATE version=version');
  }
  async list(owner: string, limit: number, after?: string): Promise<Page> {
    const result = after
      ? await this.#driver.query('SELECT id,title,completed,version FROM tasks WHERE owner=? AND id>? ORDER BY id LIMIT ?', [owner, after, limit])
      : await this.#driver.query('SELECT id,title,completed,version FROM tasks WHERE owner=? ORDER BY id LIMIT ?', [owner, limit]);
    const data = result.rows.map(taskFromRow); return { data, next_after: data.at(-1)?.id ?? null };
  }
  async find(owner: string, id: string): Promise<Task | null> { const { rows } = await this.#driver.query('SELECT id,title,completed,version FROM tasks WHERE owner=? AND id=?', [owner, id]); return rows[0] ? taskFromRow(rows[0]) : null; }
  async create(owner: string, task: Task): Promise<void> { await this.#driver.query('INSERT INTO tasks(id,owner,title,completed,version) VALUES(?,?,?,?,?)', [task.id, owner, task.title, Number(task.completed), task.version]); }
  async replace(owner: string, task: Task, expectedVersion: number): Promise<'updated' | 'missing' | 'conflict'> {
    const result = await this.#driver.query('UPDATE tasks SET title=?,completed=?,version=? WHERE owner=? AND id=? AND version=?', [task.title, Number(task.completed), task.version, owner, task.id, expectedVersion]);
    return result.changes === 1 ? 'updated' : await this.find(owner, task.id) ? 'conflict' : 'missing';
  }
  async remove(owner: string, id: string, expectedVersion: number): Promise<'deleted' | 'missing' | 'conflict'> {
    const result = await this.#driver.query('DELETE FROM tasks WHERE owner=? AND id=? AND version=?', [owner, id, expectedVersion]);
    return result.changes === 1 ? 'deleted' : await this.find(owner, id) ? 'conflict' : 'missing';
  }
  async authenticate(hash: string, nowEpoch: number): Promise<Principal | null> {
    const { rows } = await this.#driver.query('SELECT id,subject,permissions FROM api_tokens WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?', [hash, nowEpoch]);
    const row = rows[0]; return row ? { tokenId: String(row.id), subject: String(row.subject), permissions: JSON.parse(String(row.permissions)) as Permission[] } : null;
  }
  async issue(hash: string, subject: string, permissions: readonly Permission[], expiresAt: number): Promise<string> { const id = randomUUID(); await this.#driver.query('INSERT INTO api_tokens(id,token_hash,subject,permissions,expires_at) VALUES(?,?,?,?,?)', [id, hash, subject, JSON.stringify(permissions), expiresAt]); return id; }
  async revoke(tokenId: string): Promise<void> { await this.#driver.query('UPDATE api_tokens SET revoked_at=? WHERE id=? AND revoked_at IS NULL', [Math.floor(Date.now() / 1000), tokenId]); }
  async consume(key: string, window_epoch: number, limit: number): Promise<boolean> {
    return this.#driver.transaction(async query => {
      await query(this.dialect === 'postgresql'
        ? 'INSERT INTO rate_limits(key_hash,window_epoch,count) VALUES(?,?,0) ON CONFLICT DO NOTHING'
        : 'INSERT INTO rate_limits(key_hash,window_epoch,count) VALUES(?,?,0) ON DUPLICATE KEY UPDATE count=count', [key, window_epoch]);
      const result = await query('UPDATE rate_limits SET count=count+1 WHERE key_hash=? AND window_epoch=? AND count<?', [key, window_epoch, limit]);
      await query('DELETE FROM rate_limits WHERE window_epoch<?', [window_epoch - 2]);
      return result.changes === 1;
    });
  }
  close(): Promise<void> { return this.#driver.close(); }
  async revokeAll(): Promise<void> { await this.#driver.query('UPDATE api_tokens SET revoked_at=? WHERE revoked_at IS NULL', [Math.floor(Date.now()/1000)]); }
  async schemaVersion(): Promise<number> { const { rows } = await this.#driver.query('SELECT MAX(version) AS version FROM schema_migrations'); return Number(rows[0]?.version); }
}
function taskFromRow(row: Row): Task { return { id: String(row.id), title: String(row.title), completed: Number(row.completed) === 1, version: Number(row.version) }; }
