import { ErrorCode, snapshotTask, snapshotTasks } from '../domain/task.js';

export function createTaskController({ service, onChange, language = 'es-419' }) {
  if (typeof onChange !== 'function' || !service
    || ['list', 'add', 'toggle'].some((name) => typeof service[name] !== 'function')) {
    throw new TypeError('A service and render callback are required.');
  }
  const validLanguage = (value) => value === 'es-419' || value === 'en-US';
  let state = Object.freeze({
    tasks: Object.freeze([]), draft: '', error: null, notice: null,
    language: validLanguage(language) ? language : 'es-419', busy: false, activity: null,
  });

  function publish(patch) {
    state = Object.freeze({ ...state, ...patch });
    try {
      onChange(state);
    } catch (error) {
      state = Object.freeze({ ...state, busy: false, activity: null, notice: null, error: ErrorCode.UNEXPECTED_FAILURE });
      // Rendering is a trusted callback: a bug is fatal to the mounted UI, not a storage retry.
      throw error;
    }
  }

  function withConfirmedTask(task) {
    return snapshotTasks(state.tasks.some((value) => value.id === task.id)
      ? state.tasks.map((value) => value.id === task.id ? task : value)
      : [...state.tasks, task]);
  }

  async function invoke(operation, snapshot) {
    try {
      const result = await operation();
      if (result?.ok === true) return { ok: true, value: snapshot(result.value) };
      if (result?.ok === false && typeof result.error === 'string' && Object.hasOwn(ErrorCode, result.error)) {
        return { ok: false, error: result.error };
      }
    } catch {
      // A supplied service is a boundary even though the default returns Result.
    }
    return { ok: false, error: ErrorCode.UNEXPECTED_FAILURE };
  }

  const controller = Object.freeze({
    getState: () => state,
    setDraft(value) {
      if (state.busy || typeof value !== 'string') return false;
      publish({ draft: value, notice: null });
      return true;
    },
    setLanguage(value) {
      if (!validLanguage(value)) return false;
      publish({ language: value });
      return true;
    },
    async reload() {
      if (state.busy) return false;
      publish({ busy: true, activity: 'loading', error: null, notice: null });
      const result = await invoke(() => service.list(), snapshotTasks);
      publish(result.ok
        ? { tasks: result.value, error: null, notice: 'reloaded', busy: false, activity: null }
        : { error: result.error, busy: false, activity: null });
      return result.ok;
    },
    async add() {
      if (state.busy) return false;
      const draft = state.draft;
      publish({ busy: true, activity: 'saving', error: null, notice: null });
      const result = await invoke(() => service.add(draft), snapshotTask);
      publish(result.ok
        ? { tasks: withConfirmedTask(result.value), draft: '', error: null, notice: 'added', busy: false, activity: null }
        : { error: result.error, busy: false, activity: null });
      return result.ok;
    },
    async toggle(id) {
      if (state.busy) return false;
      publish({ busy: true, activity: 'saving', error: null, notice: null });
      const result = await invoke(() => service.toggle(id), snapshotTask);
      publish(result.ok
        ? { tasks: withConfirmedTask(result.value), error: null, notice: result.value.completed ? 'completedNotice' : 'reopened', busy: false, activity: null }
        : { error: result.error, busy: false, activity: null });
      return result.ok;
    },
  });
  publish({});
  return controller;
}
