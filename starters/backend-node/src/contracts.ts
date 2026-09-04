// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
export type Result<T> = T | Promise<T>;
export type Permission = 'tasks:read' | 'tasks:write';
export type Principal = Readonly<{ tokenId: string; subject: string; permissions: readonly Permission[] }>;
export type Task = Readonly<{ id: string; title: string; completed: boolean; version: number }>;
export type Page = Readonly<{ data: readonly Task[]; next_after: string | null }>;

export interface TaskRepository {
  list(owner: string, limit: number, after?: string): Result<Page>;
  find(owner: string, id: string): Result<Task | null>;
  create(owner: string, task: Task): Result<void>;
  replace(owner: string, task: Task, expectedVersion: number): Result<'updated' | 'missing' | 'conflict'>;
  remove(owner: string, id: string, expectedVersion: number): Result<'deleted' | 'missing' | 'conflict'>;
}

export interface TokenRepository {
  authenticate(hash: string, nowEpoch: number): Result<Principal | null>;
  issue(hash: string, subject: string, permissions: readonly Permission[], expiresAt: number): Result<string>;
  revoke(tokenId: string): Result<void>;
}

export interface RateLimitRepository {
  consume(keyHash: string, window: number, limit: number): Result<boolean>;
}
