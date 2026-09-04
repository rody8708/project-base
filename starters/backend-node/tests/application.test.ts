// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, replaceTask } from '../src/application.js';
import type { TaskRepository, Task, Principal } from '../src/contracts.js';

class InMemoryTasks implements TaskRepository {
  readonly values = new Map<string, Task>();
  async list(owner: string) { return { data: [...this.values.entries()].filter(([key]) => key.startsWith(owner + ':')).map(([, value]) => value), next_after: null }; }
  async find(owner: string, id: string) { return this.values.get(owner + ':' + id) ?? null; }
  async create(owner: string, task: Task) { this.values.set(owner + ':' + task.id, task); }
  async replace(owner: string, task: Task, version: number) {
    const before = await this.find(owner, task.id);
    if (!before) return 'missing' as const;
    if (before.version !== version) return 'conflict' as const;
    await this.create(owner, task); return 'updated' as const;
  }
  async remove(owner: string, id: string, version: number) {
    const before = await this.find(owner, id);
    if (!before) return 'missing' as const;
    if (before.version !== version) return 'conflict' as const;
    this.values.delete(owner + ':' + id); return 'deleted' as const;
  }
}
const principal: Principal = { tokenId: 'synthetic', subject: 'owner', permissions: ['tasks:read', 'tasks:write'] };
test('application awaits repository results without importing SQL or HTTP', async () => {
  const repo = new InMemoryTasks();
  const task = await createTask(repo, principal, { title: '  Original ñ  ' });
  assert.equal(task.title, 'Original ñ'); assert.equal((await repo.find('owner', task.id))?.version, 1);
  assert.equal((await replaceTask(repo, principal, task.id, { title: 'Changed', completed: true, version: 1 })).version, 2);
  await assert.rejects(replaceTask(repo, principal, task.id, { title: 'Stale', completed: true, version: 1 }), { code: 'VERSION_CONFLICT' });
  await assert.rejects(createTask(repo, { ...principal, permissions: [] }, { title: 'Denied' }), { code: 'FORBIDDEN' });
  await assert.rejects(createTask(repo, principal, { title: '' }), { code: 'VALIDATION_FAILED' });
  await assert.rejects(replaceTask(repo, { ...principal, subject: 'other' }, task.id, { title: 'No', completed: true, version: 2 }), { code: 'NOT_FOUND' });
});
