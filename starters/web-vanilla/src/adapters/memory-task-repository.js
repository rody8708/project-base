import { assertId, ErrorCode, snapshotTask, snapshotTasks, TaskError } from '../domain/task.js';

export function createMemoryTaskRepository() {
  const tasks = new Map();
  return Object.freeze({
    list() {
      return snapshotTasks([...tasks.values()]);
    },
    add(input) {
      const task = snapshotTask(input);
      if (tasks.has(task.id)) throw new TaskError(ErrorCode.DUPLICATE_ID);
      tasks.set(task.id, task);
      return snapshotTask(task);
    },
    update(id, transform) {
      assertId(id);
      const current = tasks.get(id);
      if (current === undefined) throw new TaskError(ErrorCode.NOT_FOUND);
      // This synchronous transform and commit cannot interleave in this JS context.
      const next = snapshotTask(transform(snapshotTask(current)));
      if (next.id !== id) throw new TaskError(ErrorCode.INVALID_ID);
      tasks.set(id, next);
      return snapshotTask(next);
    },
  });
}
