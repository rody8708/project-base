// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Page, Permission, Principal, RateLimitRepository, Task, TaskRepository, TokenRepository } from './contracts.js';

export class SqliteStore implements TaskRepository, TokenRepository, RateLimitRepository {
  readonly #db: DatabaseSync;
  constructor(path: string) {
    this.#db = new DatabaseSync(path, { enableForeignKeyConstraints: true, timeout: 5000 });
    this.#db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL, version INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS tasks_owner_id ON tasks(owner,id); CREATE TABLE IF NOT EXISTS api_tokens(id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, subject TEXT NOT NULL, permissions TEXT NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER); CREATE TABLE IF NOT EXISTS rate_limits(key_hash TEXT NOT NULL, window INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(key_hash,window));`);
  }
  list(owner: string, limit: number, after?: string): Page {
    const rows = (after
      ? this.#db.prepare('SELECT id,title,completed,version FROM tasks WHERE owner=? AND id>? ORDER BY id LIMIT ?').all(owner, after, limit)
      : this.#db.prepare('SELECT id,title,completed,version FROM tasks WHERE owner=? ORDER BY id LIMIT ?').all(owner, limit)) as Record<string, unknown>[];
    const page = rows.map(taskFromRow);
    return { data: page, next_after: page.at(-1)?.id ?? null };
  }
  find(owner: string, id: string): Task | null { const row = this.#db.prepare('SELECT id,title,completed,version FROM tasks WHERE owner=? AND id=?').get(owner, id) as Record<string, unknown>|undefined; return row ? taskFromRow(row) : null; }
  create(owner: string, task: Task): void { this.#db.prepare('INSERT INTO tasks(id,owner,title,completed,version) VALUES(?,?,?,?,?)').run(task.id, owner, task.title, task.completed ? 1 : 0, task.version); }
  replace(owner: string, task: Task, expectedVersion: number): 'updated'|'missing'|'conflict' { const result = this.#db.prepare('UPDATE tasks SET title=?,completed=?,version=? WHERE owner=? AND id=? AND version=?').run(task.title, task.completed ? 1 : 0, task.version, owner, task.id, expectedVersion); if (Number(result.changes) === 1) return 'updated'; return this.find(owner, task.id) ? 'conflict' : 'missing'; }
  remove(owner: string, id: string, expectedVersion: number): 'deleted'|'missing'|'conflict' { const result = this.#db.prepare('DELETE FROM tasks WHERE owner=? AND id=? AND version=?').run(owner,id,expectedVersion); if (Number(result.changes) === 1) return 'deleted'; return this.find(owner,id) ? 'conflict' : 'missing'; }
  authenticate(hash: string, nowEpoch: number): Principal|null { const row = this.#db.prepare('SELECT id,subject,permissions FROM api_tokens WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?').get(hash, nowEpoch) as Record<string,unknown>|undefined; return row ? { tokenId:String(row.id), subject:String(row.subject), permissions:JSON.parse(String(row.permissions)) as Permission[] } : null; }
  issue(hash: string, subject: string, permissions: readonly Permission[], expiresAt: number): string { const id = randomUUID(); this.#db.prepare('INSERT INTO api_tokens(id,token_hash,subject,permissions,expires_at) VALUES(?,?,?,?,?)').run(id,hash,subject,JSON.stringify(permissions),expiresAt); return id; }
  revoke(tokenId: string): void { this.#db.prepare('UPDATE api_tokens SET revoked_at=? WHERE id=? AND revoked_at IS NULL').run(Math.floor(Date.now()/1000),tokenId); }
  consume(keyHash: string, window: number, limit: number): boolean {
    this.#db.exec('BEGIN IMMEDIATE');
    try {
      const row=this.#db.prepare('SELECT count FROM rate_limits WHERE key_hash=? AND window=?').get(keyHash,window) as {count:number}|undefined;
      if(!row) this.#db.prepare('INSERT INTO rate_limits(key_hash,window,count) VALUES(?,?,1)').run(keyHash,window);
      else if(Number(row.count)>=limit){ this.#db.exec('ROLLBACK'); return false; }
      else this.#db.prepare('UPDATE rate_limits SET count=count+1 WHERE key_hash=? AND window=?').run(keyHash,window);
      this.#db.prepare('DELETE FROM rate_limits WHERE window<?').run(window-2); this.#db.exec('COMMIT'); return true;
    } catch(error) { this.#db.exec('ROLLBACK'); throw error; }
  }
  close(): void { this.#db.close(); }
}
function taskFromRow(row: Record<string,unknown>): Task { return { id:String(row.id), title:String(row.title), completed:Number(row.completed)===1, version:Number(row.version) }; }
