// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, ErrorCode, toggleTask } from '../src/domain/task.js';
import { createMemoryTaskRepository } from '../src/adapters/memory-task-repository.js';
import { createTaskService } from '../src/application/task-service.js';
import { createTaskController } from '../src/ui/task-controller.js';
import { messages as spanish } from '../src/i18n/es-419.js';
import { messages as english } from '../src/i18n/en-US.js';

const ok = (value) => ({ ok: true, value });
const fail = (error) => ({ ok: false, error });
const task = createTask('one', 'Confirmed', 0);
const defaultService = () => {
  let id = 0;
  return createTaskService({ repository: createMemoryTaskRepository(), nextId: () => `task-${++id}`, now: () => 0 });
};
const make = (service = defaultService(), onChange = () => {}) => createTaskController({ service, onChange });

test('initial state and published snapshots are immutable and default to Spanish', async () => {
  const history = [];
  const controller = make(undefined, (state) => history.push(state));
  assert.equal(controller.getState().language, 'es-419');
  assert.equal(await controller.reload(), true);
  assert.ok(history.some((state) => state.busy && state.activity === 'loading'));
  assert.equal(controller.getState().busy, false);
  assert.deepEqual(controller.getState().tasks, []);
  assert.ok(history.every(Object.isFrozen));
  assert.throws(() => { controller.getState().draft = 'outside'; }, TypeError);
});

test('add, complete, reopen, and reload preserve normal state', async () => {
  const controller = make();
  await controller.reload();
  controller.setDraft('  Example  ');
  assert.equal(await controller.add(), true);
  assert.equal(controller.getState().tasks[0].title, 'Example');
  assert.equal(controller.getState().draft, '');
  assert.equal(await controller.toggle('task-1'), true);
  assert.equal(controller.getState().notice, 'completedNotice');
  assert.equal(await controller.toggle('task-1'), true);
  assert.equal(controller.getState().notice, 'reopened');
  await controller.reload();
  assert.equal(controller.getState().tasks.length, 1);
  assert.equal(controller.getState().tasks[0].completed, false);
});

test('validation failure preserves a draft and success clears its error', async () => {
  const controller = make();
  controller.setDraft('😀'.repeat(81));
  assert.equal(await controller.add(), false);
  assert.equal(controller.getState().error, ErrorCode.TITLE_TOO_LONG);
  assert.equal(controller.getState().draft, '😀'.repeat(81));
  controller.setDraft('😀'.repeat(80));
  assert.equal(await controller.add(), true);
  assert.equal(controller.getState().error, null);
});

test('language changes preserve user text, draft, task identity, and completion', async () => {
  const controller = make();
  controller.setDraft('<b>User text</b>');
  await controller.add();
  await controller.toggle('task-1');
  controller.setDraft('Unsubmitted');
  const before = controller.getState();
  assert.equal(controller.setLanguage('en-US'), true);
  assert.equal(controller.getState().tasks, before.tasks);
  assert.equal(controller.getState().draft, 'Unsubmitted');
  assert.equal(controller.getState().tasks[0].title, '<b>User text</b>');
  assert.equal(controller.setLanguage('unsupported'), false);
  assert.equal(controller.getState().language, 'en-US');
});

test('successful add never depends on a subsequent read and remains after a failed reload', async () => {
  let reads = 0;
  const service = {
    list() { reads++; return reads === 1 ? ok([]) : fail(ErrorCode.STORAGE_FAILURE); },
    add: () => ok(task), toggle: () => ok(toggleTask(task)),
  };
  const controller = make(service);
  await controller.reload();
  controller.setDraft('Confirmed');
  assert.equal(await controller.add(), true);
  assert.equal(reads, 1);
  assert.deepEqual(controller.getState().tasks, [task]);
  assert.equal(await controller.reload(), false);
  assert.deepEqual(controller.getState().tasks, [task]);
  assert.equal(controller.getState().error, ErrorCode.STORAGE_FAILURE);
});

test('successful toggle never depends on a subsequent read and retains other rows', async () => {
  let reads = 0;
  const other = createTask('two', 'Unchanged', 1);
  const service = {
    list() { reads++; return reads === 1 ? ok([task, other]) : fail(ErrorCode.STORAGE_FAILURE); },
    add: () => ok(task), toggle: () => ok(toggleTask(task)),
  };
  const controller = make(service);
  await controller.reload();
  assert.equal(await controller.toggle('one'), true);
  assert.equal(reads, 1);
  assert.deepEqual(controller.getState().tasks, [toggleTask(task), other]);
  await controller.reload();
  assert.deepEqual(controller.getState().tasks, [toggleTask(task), other]);
});

test('known write failure preserves draft and last confirmed state', async () => {
  const controller = make({ list: () => ok([task]), add: () => fail(ErrorCode.STORAGE_FAILURE), toggle: () => fail(ErrorCode.STORAGE_FAILURE) });
  await controller.reload();
  controller.setDraft('Keep me');
  assert.equal(await controller.add(), false);
  assert.equal(controller.getState().draft, 'Keep me');
  assert.equal(await controller.toggle('one'), false);
  assert.deepEqual(controller.getState().tasks, [task]);
  assert.equal(controller.getState().busy, false);
});

test('unexpected service rejections on load/add/toggle are contained without private details', async () => {
  const rejecting = async () => { throw new Error('SYNTHETIC_PRIVATE_DETAIL'); };
  const controller = make({ list: rejecting, add: rejecting, toggle: rejecting });
  controller.setDraft('Keep me');
  for (const action of [() => controller.reload(), () => controller.add(), () => controller.toggle('one')]) {
    assert.equal(await action(), false);
    assert.equal(controller.getState().error, ErrorCode.UNEXPECTED_FAILURE);
    assert.equal(controller.getState().busy, false);
    assert.ok(!JSON.stringify(controller.getState()).includes('SYNTHETIC_PRIVATE_DETAIL'));
  }
});

test('invalid service result shapes and unknown codes are not treated as success', async () => {
  for (const invalid of [null, {}, { ok: 'true', value: [] }, fail('UNKNOWN'), fail(new String('INVALID_ID')), ok([{ ...task, completed: 1 }]), ok([task, task])]) {
    const controller = make({ list: () => invalid, add: () => invalid, toggle: () => invalid });
    for (const operation of [() => controller.reload(), () => controller.add(), () => controller.toggle('one')]) {
      assert.equal(await operation(), false);
      assert.equal(controller.getState().error, ErrorCode.UNEXPECTED_FAILURE);
    }
  }
});

test('busy controller rejects overlapping writes, reloads, and draft changes', async () => {
  let finish;
  let calls = 0;
  const pending = new Promise((resolve) => { finish = resolve; });
  const controller = make({ list: () => ok([]), add: () => { calls++; return pending; }, toggle: () => assert.fail('No concurrent toggle expected') });
  controller.setDraft('Confirmed');
  const first = controller.add();
  assert.equal(controller.getState().busy, true);
  assert.equal(controller.setDraft('Must not replace in-flight draft'), false);
  assert.equal(await controller.add(), false);
  assert.equal(await controller.toggle('one'), false);
  assert.equal(await controller.reload(), false);
  assert.equal(controller.setLanguage('en-US'), true);
  finish(ok(task));
  assert.equal(await first, true);
  assert.equal(calls, 1);
  assert.equal(controller.getState().language, 'en-US');
  assert.equal(controller.getState().busy, false);
});

test('failed renderer before an operation rejects without starting storage or leaving busy state', async () => {
  let breakRenderer = false;
  let calls = 0;
  const error = new Error('SYNTHETIC_RENDER_BUG');
  const controller = make({ list: () => ok([]), add: () => { calls++; return ok(task); }, toggle: () => ok(task) }, () => { if (breakRenderer) throw error; });
  controller.setDraft('Confirmed');
  breakRenderer = true;
  await assert.rejects(controller.add(), (caught) => caught === error);
  assert.equal(calls, 0);
  assert.equal(controller.getState().busy, false);
  assert.equal(controller.getState().error, ErrorCode.UNEXPECTED_FAILURE);
});

test('failed renderer after a confirmed write retains the commit and propagates the bug', async () => {
  const error = new Error('SYNTHETIC_RENDER_BUG');
  const controller = make({ list: () => ok([]), add: () => ok(task), toggle: () => ok(task) }, (state) => { if (state.notice === 'added') throw error; });
  controller.setDraft('Confirmed');
  await assert.rejects(controller.add(), (caught) => caught === error);
  assert.deepEqual(controller.getState().tasks, [task]);
  assert.equal(controller.getState().busy, false);
  assert.equal(controller.getState().draft, '');
});

test('initial renderer failure is fatal and invalid controller dependencies are rejected', () => {
  assert.throws(() => make(undefined, () => { throw new Error('render failure'); }), /render failure/);
  assert.throws(() => createTaskController({}), TypeError);
});

test('translation files have matching string keys and cover every domain error', () => {
  assert.deepEqual(Object.keys(spanish).sort(), Object.keys(english).sort());
  for (const messages of [spanish, english]) {
    assert.ok(Object.isFrozen(messages));
    assert.ok(Object.values(messages).every((value) => typeof value === 'string' && value.length > 0));
    for (const code of Object.values(ErrorCode)) assert.equal(typeof messages[`error_${code}`], 'string');
  }
});
