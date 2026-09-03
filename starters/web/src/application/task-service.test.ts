// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it, vi } from 'vitest';
import { createMemoryTaskRepository } from '../adapters/memory-task-repository';
import { failure } from '../domain/task';
import { createTaskService } from './task-service';
import type { TaskRepository } from './task-service';

function setup(repository = createMemoryTaskRepository()) {
  let sequence = 0;
  const nextId = vi.fn(() => `task-${++sequence}`);
  const now = vi.fn(() => 1234);
  return { repository, nextId, now, service: createTaskService({ repository, nextId, now }) };
}

describe('task use cases and memory adapter', () => {
  it('starts empty and adds in insertion order with deterministic dependencies', async () => {
    const { service } = setup();
    expect(await service.list()).toEqual({ ok: true, value: [] });
    await service.add(' Uno ');
    await service.add('Dos');
    const result = await service.list();
    expect(result).toEqual({ ok: true, value: [
      { id: 'task-1', title: 'Uno', completed: false, createdAtEpochMs: 1234 },
      { id: 'task-2', title: 'Dos', completed: false, createdAtEpochMs: 1234 },
    ] });
  });
  it('does not obtain identity or time, or write, for invalid titles', async () => {
    const { service, nextId, now } = setup();
    expect(await service.add(null)).toEqual(failure('INVALID_TITLE'));
    expect(nextId).not.toHaveBeenCalled();
    expect(now).not.toHaveBeenCalled();
    expect(await service.list()).toEqual({ ok: true, value: [] });
  });
  it('toggles atomically twice and preserves the previous snapshot', async () => {
    const { service } = setup();
    const added = await service.add('Uno');
    await Promise.all([service.toggle('task-1'), service.toggle('task-1')]);
    const listed = await service.list();
    expect(added.ok && added.value.completed).toBe(false);
    expect(listed.ok && listed.value[0]?.completed).toBe(false);
    expect(await service.toggle('missing')).toEqual(failure('NOT_FOUND'));
  });
  it('does not overwrite a duplicate identity', async () => {
    const { repository } = setup();
    const service = createTaskService({ repository, nextId: () => 'fixed', now: () => 0 });
    await service.add('Original');
    expect(await service.add('Replacement')).toEqual(failure('DUPLICATE_ID'));
    const listed = await service.list();
    expect(listed.ok && listed.value.map((task) => task.title)).toEqual(['Original']);
  });
  it('keeps separate repository instances independent', async () => {
    const first = setup();
    const second = setup();
    await first.service.add('Private to this instance');
    expect(await second.service.list()).toEqual({ ok: true, value: [] });
  });
  it('returns explicit ID and clock failures without saving', async () => {
    const { repository } = setup();
    expect(await createTaskService({ repository, nextId: () => '', now: () => 0 }).add('Uno')).toEqual(failure('INVALID_ID'));
    expect(await createTaskService({ repository, nextId: () => 'a', now: () => -1 }).add('Uno')).toEqual(failure('INVALID_TIMESTAMP'));
    expect(await createTaskService({ repository, nextId: () => { throw new Error('private detail'); }, now: () => 0 }).add('Uno')).toEqual(failure('DEPENDENCY_FAILURE'));
    expect(await repository.list()).toEqual({ ok: true, value: [] });
  });
  it('preserves typed repository errors', async () => {
    const repository: TaskRepository = {
      list: async () => failure('STORAGE_UNAVAILABLE'),
      add: async () => failure('STORAGE_UNAVAILABLE'),
      update: async () => failure('STORAGE_UNAVAILABLE'),
    };
    const { service } = setup(repository);
    expect(await service.list()).toEqual(failure('STORAGE_UNAVAILABLE'));
    expect(await service.add('Uno')).toEqual(failure('STORAGE_UNAVAILABLE'));
    expect(await service.toggle('1')).toEqual(failure('STORAGE_UNAVAILABLE'));
  });
  it('contains thrown storage errors, leaks no details, and never retries implicitly', async () => {
    const fail = vi.fn(async () => { throw new Error('private path/token'); });
    const repository: TaskRepository = { list: fail, add: fail, update: fail };
    const { service } = setup(repository);
    expect(await service.list()).toEqual(failure('STORAGE_UNAVAILABLE'));
    expect(await service.add('Uno')).toEqual(failure('STORAGE_UNAVAILABLE'));
    expect(await service.toggle('1')).toEqual(failure('STORAGE_UNAVAILABLE'));
    expect(fail).toHaveBeenCalledTimes(3);
  });
  it('rejects a transform that changes identity without modifying the stored task', async () => {
    const { service, repository } = setup();
    await service.add('Uno');
    expect(await repository.update('task-1', (task) => ({ ...task, id: 'other' }))).toEqual(failure('INVALID_ID'));
    const listed = await repository.list();
    expect(listed.ok && listed.value.map((task) => task.id)).toEqual(['task-1']);
  });
});
