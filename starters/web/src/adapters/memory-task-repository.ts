// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { failure } from '../domain/task';
import type { TaskRepository } from '../application/task-service';
import type { Task } from '../domain/task';

export function createMemoryTaskRepository(): TaskRepository {
  const tasks = new Map<string, Task>();
  const copy = (task: Task): Task => Object.freeze({ ...task });

  return {
    async list() {
      return { ok: true, value: Object.freeze([...tasks.values()].map(copy)) };
    },
    async add(task) {
      if (tasks.has(task.id)) return failure('DUPLICATE_ID');
      const stored = copy(task);
      tasks.set(stored.id, stored);
      return { ok: true, value: copy(stored) };
    },
    async update(id, transform) {
      const current = tasks.get(id);
      if (!current) return failure('NOT_FOUND');
      // No await occurs between reading and replacing in this in-process adapter.
      const updated = copy(transform(copy(current)));
      if (updated.id !== id) return failure('INVALID_ID');
      tasks.set(id, updated);
      return { ok: true, value: copy(updated) };
    },
  };
}
