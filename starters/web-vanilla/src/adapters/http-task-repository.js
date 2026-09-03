import { TaskError, ErrorCode } from '../domain/task.js';
import { ApiFailure, createTaskApi } from './task-api.js';

export function createHttpTaskRepository(url, tokenProvider = () => null) {
  const api = createTaskApi(url, undefined, undefined, tokenProvider);
  let snapshots = new Map();
  const local = (task) => Object.freeze({ id: task.id, title: task.title, completed: task.completed, createdAtMs: null });
  async function run(operation) {
    try { return await operation(); } catch (cause) {
      throw new TaskError(cause instanceof ApiFailure && cause.code === 'NOT_FOUND' ? ErrorCode.NOT_FOUND
        : cause instanceof ApiFailure && cause.code === 'VALIDATION_FAILED' ? ErrorCode.INVALID_TITLE : ErrorCode.STORAGE_FAILURE);
    }
  }
  return Object.freeze({
    list: () => run(async () => {
      const rows = await api.list();
      snapshots = new Map(rows.map(row => [row.id, row]));
      return rows.map(local);
    }),
    add: (task) => run(async () => {
      const row = await api.create(task.title);
      snapshots.set(row.id, row);
      return local(row);
    }),
    update: (id, transform) => run(async () => {
      const current = snapshots.get(id);
      if (!current) throw new ApiFailure('NOT_FOUND');
      const next = transform(local(current));
      if (next.id !== id || next.title !== current.title) throw new ApiFailure('VALIDATION_FAILED');
      const row = await api.replace(current, next.completed);
      snapshots.set(id, row);
      return local(row);
    }),
  });
}
