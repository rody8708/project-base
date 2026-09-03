// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { failure } from '../domain/task';
import type { Task } from '../domain/task';
import type { TaskRepository } from '../application/task-service';
import { ApiFailure, createTaskApi } from './task-api.js';
import type { WireTask } from './task-api.js';

export function createHttpTaskRepository(url: string, tokenProvider: () => string | null = () => null): TaskRepository {
  const api = createTaskApi(url, undefined, undefined, tokenProvider);
  let snapshots = new Map<string, WireTask>();
  const local = (task: WireTask): Task => Object.freeze({ ...task, createdAtEpochMs: null });
  const error = (cause: unknown) => failure(cause instanceof ApiFailure && cause.code === 'NOT_FOUND'
    ? 'NOT_FOUND' : cause instanceof ApiFailure && cause.code === 'VALIDATION_FAILED' ? 'INVALID_TITLE' : 'STORAGE_UNAVAILABLE');
  return {
    async list() {
      try {
        const rows = await api.list();
        snapshots = new Map(rows.map(row => [row.id, row]));
        return { ok: true, value: rows.map(local) };
      } catch (cause) { return error(cause); }
    },
    async add(task) {
      try {
        const row = await api.create(task.title);
        snapshots.set(row.id, row);
        return { ok: true, value: local(row) };
      } catch (cause) { return error(cause); }
    },
    async update(id, transform) {
      const current = snapshots.get(id);
      if (!current) return failure('NOT_FOUND');
      try {
        const next = transform(local(current));
        if (next.id !== id || next.title !== current.title) return failure('INVALID_ID');
        const row = await api.replace(current, next.completed);
        snapshots.set(id, row);
        return { ok: true, value: local(row) };
      } catch (cause) { return error(cause); }
    },
  };
}
