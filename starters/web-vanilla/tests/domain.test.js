import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertId, createTask, ErrorCode, MAX_CREATED_AT_MS, snapshotTask, snapshotTasks, TaskError, toggleTask, validateTitle,
} from '../src/domain/task.js';
import { createMemoryTaskRepository } from '../src/adapters/memory-task-repository.js';
import { createTaskService } from '../src/application/task-service.js';

const rejectsWith = (operation, code) => assert.throws(operation, (error) => error instanceof TaskError && error.code === code);
const fixture = (repository = createMemoryTaskRepository()) => {
  let sequence = 0;
  return createTaskService({ repository, nextId: () => `task-${++sequence}`, now: () => 1234 });
};

test('title trims edges without normalizing case, combining marks, or literal markup', () => {
  assert.equal(validateTitle('\u00a0  Café e\u0301 <b>literal</b>  \u00a0'), 'Café e\u0301 <b>literal</b>');
});

test('title rejects absence, wrong types, blanks, internal controls, and broken UTF-16', () => {
  for (const value of [null, undefined, false, 0, [], {}, '', ' \u00a0 ', 'a\nb', 'a\rb', 'a\0b', 'a\u0085b', 'a\u2028b', 'a\u2029b', '\ud800', '\udc00', '\ud800a']) {
    rejectsWith(() => validateTitle(value), ErrorCode.INVALID_TITLE);
  }
});

test('80 code points are accepted and 81 rejected, including surrogate pairs', () => {
  for (const point of ['a', 'á', '😀']) {
    assert.equal(validateTitle(point.repeat(80)), point.repeat(80));
    rejectsWith(() => validateTitle(point.repeat(81)), ErrorCode.TITLE_TOO_LONG);
  }
  assert.equal(validateTitle('e\u0301'.repeat(40)), 'e\u0301'.repeat(40));
  rejectsWith(() => validateTitle('e\u0301'.repeat(41)), ErrorCode.TITLE_TOO_LONG);
});

test('IDs have exact ASCII bounds and reject trailing line terminators', () => {
  for (const value of ['a', 'A_0-b', 'x'.repeat(100)]) assert.doesNotThrow(() => assertId(value));
  for (const value of ['', 'x'.repeat(101), 'a\n', 'a\r', 'a\u2028', '../id', 'two ids', 'á', 0, null]) {
    rejectsWith(() => assertId(value), ErrorCode.INVALID_ID);
  }
});

test('creation time is a bounded safe integer, not an arbitrary coercible number', () => {
  assert.equal(createTask('a', 'A', 0).createdAtMs, 0);
  assert.equal(createTask('a', 'A', MAX_CREATED_AT_MS).createdAtMs, MAX_CREATED_AT_MS);
  for (const value of [-1, MAX_CREATED_AT_MS + 1, 0.5, NaN, Infinity, '0', null, 1n]) {
    rejectsWith(() => createTask('a', 'A', value), ErrorCode.INVALID_TIME);
  }
});

test('task values and snapshots cannot bypass field invariants', () => {
  const valid = createTask('a', 'A', 0);
  for (const value of [null, [], false]) rejectsWith(() => snapshotTask(value), ErrorCode.INVALID_TASK);
  rejectsWith(() => snapshotTask({ ...valid, title: ' untrimmed ' }), ErrorCode.INVALID_TITLE);
  rejectsWith(() => snapshotTask({ ...valid, completed: 1 }), ErrorCode.INVALID_STATE);
  rejectsWith(() => snapshotTask({ ...valid, id: '' }), ErrorCode.INVALID_ID);
  rejectsWith(() => snapshotTask({ ...valid, createdAtMs: -1 }), ErrorCode.INVALID_TIME);
  assert.ok(Object.isFrozen(valid));
  assert.throws(() => { valid.title = 'Mutated'; }, TypeError);
});

test('toggle creates a valid new value and two toggles restore the original', () => {
  const original = createTask('a', 'A', 0);
  const completed = toggleTask(original);
  assert.equal(original.completed, false);
  assert.equal(completed.completed, true);
  assert.notEqual(completed, original);
  assert.deepEqual(toggleTask(completed), original);
});

test('list snapshots reject duplicate identities and are frozen', () => {
  const task = createTask('a', 'A', 0);
  rejectsWith(() => snapshotTasks([task, task]), ErrorCode.DUPLICATE_ID);
  rejectsWith(() => snapshotTasks({}), ErrorCode.INVALID_TASK);
  rejectsWith(() => snapshotTasks(Array(1)), ErrorCode.INVALID_TASK);
  rejectsWith(() => snapshotTasks([task, ,]), ErrorCode.INVALID_TASK);
  const tasks = snapshotTasks([task]);
  assert.ok(Object.isFrozen(tasks));
  assert.throws(() => tasks.push(task), TypeError);
});

test('repository copies incoming objects and outgoing collections', () => {
  const repository = createMemoryTaskRepository();
  const external = { ...createTask('a', 'Original', 0) };
  repository.add(external);
  external.title = 'Changed externally';
  const first = repository.list();
  repository.update('a', toggleTask);
  repository.add(createTask('b', 'Second', 0));
  assert.equal(first.length, 1);
  assert.equal(first[0].title, 'Original');
  assert.equal(first[0].completed, false);
  assert.deepEqual(repository.list().map((task) => task.id), ['a', 'b']);
  assert.throws(() => { first[0].completed = true; }, TypeError);
  assert.equal(createMemoryTaskRepository().list().length, 0);
});

test('duplicate, missing, invalid, throwing, and asynchronous transforms cannot corrupt memory', () => {
  const repository = createMemoryTaskRepository();
  const original = createTask('a', 'Original', 0);
  repository.add(original);
  rejectsWith(() => repository.add(createTask('a', 'Duplicate', 0)), ErrorCode.DUPLICATE_ID);
  rejectsWith(() => repository.update('missing', toggleTask), ErrorCode.NOT_FOUND);
  rejectsWith(() => repository.update('a', (task) => ({ ...task, id: 'different' })), ErrorCode.INVALID_ID);
  rejectsWith(() => repository.update('a', (task) => ({ ...task, title: '' })), ErrorCode.INVALID_TITLE);
  rejectsWith(() => repository.update('a', async (task) => task), ErrorCode.INVALID_ID);
  assert.throws(() => repository.update('a', () => { throw new Error('synthetic failure'); }));
  assert.deepEqual(repository.list(), [original]);
});

test('service uses deterministic IDs/time and exposes frozen results', async () => {
  const service = fixture();
  assert.deepEqual((await service.list()).value, []);
  const result = await service.add('  First  ');
  assert.deepEqual(result, { ok: true, value: createTask('task-1', 'First', 1234) });
  assert.ok(Object.isFrozen(result));
  assert.equal((await service.toggle('task-1')).value.completed, true);
});

test('invalid input does not consume ID/time or invoke storage', async () => {
  const repository = { list() {}, add() { assert.fail('No storage call expected'); }, update() {} };
  const service = createTaskService({ repository, nextId: () => assert.fail('No ID expected'), now: () => assert.fail('No clock expected') });
  assert.deepEqual(await service.add(null), { ok: false, error: ErrorCode.INVALID_TITLE });
  assert.deepEqual(await service.toggle('bad id'), { ok: false, error: ErrorCode.INVALID_ID });
});

test('invalid provider values and throwing providers produce distinct failures', async () => {
  const repository = createMemoryTaskRepository();
  assert.deepEqual(await createTaskService({ repository, nextId: () => '', now: () => 0 }).add('A'), { ok: false, error: ErrorCode.INVALID_ID });
  assert.deepEqual(await createTaskService({ repository, nextId: () => 'a', now: () => -1 }).add('A'), { ok: false, error: ErrorCode.INVALID_TIME });
  for (const field of ['nextId', 'now']) {
    const dependencies = { repository, nextId: () => 'a', now: () => 0 };
    dependencies[field] = () => { throw new Error('SYNTHETIC_PRIVATE_DETAIL'); };
    assert.deepEqual(await createTaskService(dependencies).add('A'), { ok: false, error: ErrorCode.DEPENDENCY_FAILURE });
  }
  assert.equal(repository.list().length, 0);
});

test('known duplicate IDs do not overwrite and missing tasks stay missing', async () => {
  const repository = createMemoryTaskRepository();
  const service = createTaskService({ repository, nextId: () => 'fixed', now: () => 0 });
  await service.add('First');
  assert.deepEqual(await service.add('Second'), { ok: false, error: ErrorCode.DUPLICATE_ID });
  assert.deepEqual(await service.toggle('missing'), { ok: false, error: ErrorCode.NOT_FOUND });
  assert.equal(repository.list()[0].title, 'First');
});

test('storage errors do not expose details or automatically retry an uncertain write', async () => {
  const backing = createMemoryTaskRepository();
  let calls = 0;
  const repository = {
    list: backing.list,
    update: backing.update,
    add(task) { calls++; backing.add(task); throw new Error('SYNTHETIC_PRIVATE_DETAIL'); },
  };
  const service = fixture(repository);
  const result = await service.add('Possibly saved');
  assert.deepEqual(result, { ok: false, error: ErrorCode.STORAGE_FAILURE });
  assert.equal(calls, 1);
  assert.equal((await service.list()).value.length, 1);
  assert.ok(!JSON.stringify(result).includes('SYNTHETIC_PRIVATE_DETAIL'));
});

test('asynchronous repository rejection becomes a failure result', async () => {
  const fail = async () => { throw new Error('SYNTHETIC_PRIVATE_DETAIL'); };
  const service = fixture({ list: fail, add: fail, update: fail });
  for (const result of await Promise.all([service.list(), service.add('A'), service.toggle('a')])) {
    assert.deepEqual(result, { ok: false, error: ErrorCode.STORAGE_FAILURE });
  }
});

test('concurrent service calls do not lose synchronous in-memory toggles', async () => {
  const service = fixture();
  await service.add('A');
  const results = await Promise.all(Array.from({ length: 100 }, () => service.toggle('task-1')));
  assert.ok(results.every((result) => result.ok));
  assert.equal((await service.list()).value[0].completed, false);
});

test('dependencies are explicit and unsupported error codes are rejected', () => {
  assert.throws(() => createTaskService({}), TypeError);
  assert.throws(() => new TaskError('UNRECOGNIZED'), TypeError);
});
