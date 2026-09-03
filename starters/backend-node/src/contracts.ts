// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
export type Permission = 'tasks:read' | 'tasks:write';
export type Principal = Readonly<{ tokenId: string; subject: string; permissions: readonly Permission[] }>;
export type Task = Readonly<{ id: string; title: string; completed: boolean; version: number }>;
export type Page = Readonly<{ data: readonly Task[]; next_after: string | null }>;

export interface TaskRepository {
  list(owner: string, limit: number, after?: string): Page;
  find(owner: string, id: string): Task | null;
  create(owner: string, task: Task): void;
  replace(owner: string, task: Task, expectedVersion: number): 'updated' | 'missing' | 'conflict';
  remove(owner: string, id: string, expectedVersion: number): 'deleted' | 'missing' | 'conflict';
}

export interface TokenRepository {
  authenticate(hash: string, nowEpoch: number): Principal | null;
  issue(hash: string, subject: string, permissions: readonly Permission[], expiresAt: number): string;
  revoke(tokenId: string): void;
}

export interface RateLimitRepository {
  consume(keyHash: string, window: number, limit: number): boolean;
}
