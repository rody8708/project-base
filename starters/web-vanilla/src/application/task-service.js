import {
  assertId, createTask, ErrorCode, snapshotTask, snapshotTasks, TaskError, toggleTask, validateTitle,
} from '../domain/task.js';

const success = (value) => Object.freeze({ ok: true, value });
const failure = (error) => Object.freeze({ ok: false, error });

export function createTaskService({ repository, nextId, now }) {
  if (!repository || ['list', 'add', 'update'].some((name) => typeof repository[name] !== 'function')
    || typeof nextId !== 'function' || typeof now !== 'function') {
    throw new TypeError('Explicit repository, ID generator, and clock are required.');
  }

  async function storage(operation, snapshot) {
    try {
      return success(snapshot(await operation()));
    } catch (error) {
      // No retry: another adapter might have committed before failing.
      return failure(error instanceof TaskError ? error.code : ErrorCode.STORAGE_FAILURE);
    }
  }

  return Object.freeze({
    list() {
      return storage(() => repository.list(), snapshotTasks);
    },
    async add(input) {
      let title;
      try {
        title = validateTitle(input);
      } catch (error) {
        return failure(error instanceof TaskError ? error.code : ErrorCode.UNEXPECTED_FAILURE);
      }
      let task;
      try {
        task = createTask(nextId(), title, now());
      } catch (error) {
        return failure(error instanceof TaskError ? error.code : ErrorCode.DEPENDENCY_FAILURE);
      }
      return storage(() => repository.add(task), snapshotTask);
    },
    async toggle(id) {
      try {
        assertId(id);
      } catch (error) {
        return failure(error instanceof TaskError ? error.code : ErrorCode.UNEXPECTED_FAILURE);
      }
      return storage(() => repository.update(id, toggleTask), snapshotTask);
    },
  });
}
