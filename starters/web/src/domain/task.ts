export const MAX_TITLE_LENGTH = 80;

export type TaskErrorCode =
  | 'INVALID_TITLE'
  | 'TITLE_TOO_LONG'
  | 'INVALID_ID'
  | 'INVALID_TIMESTAMP'
  | 'NOT_FOUND'
  | 'DUPLICATE_ID'
  | 'STORAGE_UNAVAILABLE'
  | 'DEPENDENCY_FAILURE';

export type TaskError = Readonly<{ code: TaskErrorCode }>;
export type Result<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: TaskError }>;

export type Task = Readonly<{
  id: string;
  title: string;
  completed: boolean;
  createdAtEpochMs: number | null;
}>;

export function failure(code: TaskErrorCode): Result<never> {
  return { ok: false, error: { code } };
}

export function validateTitle(input: unknown): Result<string> {
  if (typeof input !== 'string') return failure('INVALID_TITLE');
  const title = input.trim();
  if (title.length === 0 || /[\u0000-\u001f\u007f-\u009f\u2028\u2029\ud800-\udfff]/u.test(title)) {
    return failure('INVALID_TITLE');
  }
  if ([...title].length > MAX_TITLE_LENGTH) return failure('TITLE_TOO_LONG');
  return { ok: true, value: title };
}

export function createTask(input: Readonly<{
  id: unknown;
  title: unknown;
  createdAtEpochMs: unknown;
}>): Result<Task> {
  const title = validateTitle(input.title);
  if (!title.ok) return title;
  if (typeof input.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/u.test(input.id)) {
    return failure('INVALID_ID');
  }
  const timestamp = input.createdAtEpochMs;
  if (typeof timestamp !== 'number' || !Number.isSafeInteger(timestamp)
    || timestamp < 0 || timestamp > 8_640_000_000_000_000) {
    return failure('INVALID_TIMESTAMP');
  }
  return {
    ok: true,
    value: Object.freeze({ id: input.id, title: title.value, completed: false, createdAtEpochMs: timestamp }),
  };
}

export function toggleTask(task: Task): Task {
  return Object.freeze({ ...task, completed: !task.completed });
}
