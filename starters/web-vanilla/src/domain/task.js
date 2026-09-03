export const MAX_TITLE_CODE_POINTS = 80;
export const MAX_CREATED_AT_MS = 8_640_000_000_000_000;
export const ErrorCode = Object.freeze({
  INVALID_TITLE: 'INVALID_TITLE',
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',
  INVALID_ID: 'INVALID_ID',
  INVALID_TIME: 'INVALID_TIME',
  INVALID_STATE: 'INVALID_STATE',
  INVALID_TASK: 'INVALID_TASK',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ID: 'DUPLICATE_ID',
  STORAGE_FAILURE: 'STORAGE_FAILURE',
  DEPENDENCY_FAILURE: 'DEPENDENCY_FAILURE',
  UNEXPECTED_FAILURE: 'UNEXPECTED_FAILURE',
});

export class TaskError extends Error {
  constructor(code) {
    if (typeof code !== 'string' || !Object.hasOwn(ErrorCode, code)) throw new TypeError('Unknown task error code.');
    super(code);
    this.name = 'TaskError';
    this.code = code;
    Object.freeze(this);
  }
}

export function assertId(id) {
  if (typeof id !== 'string' || id.length < 1 || id.length > 100 || /[^A-Za-z0-9_-]/.test(id)) {
    throw new TaskError(ErrorCode.INVALID_ID);
  }
}

export function validateTitle(input) {
  if (typeof input !== 'string') throw new TaskError(ErrorCode.INVALID_TITLE);
  const title = input.trim();
  if (title.length === 0) throw new TaskError(ErrorCode.INVALID_TITLE);
  let length = 0;
  for (const character of title) {
    const point = character.codePointAt(0);
    if (point <= 0x1f || (point >= 0x7f && point <= 0x9f)
      || point === 0x2028 || point === 0x2029 || (point >= 0xd800 && point <= 0xdfff)) {
      throw new TaskError(ErrorCode.INVALID_TITLE);
    }
    length++;
  }
  if (length > MAX_TITLE_CODE_POINTS) throw new TaskError(ErrorCode.TITLE_TOO_LONG);
  return title;
}

function assertTime(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_CREATED_AT_MS) {
    throw new TaskError(ErrorCode.INVALID_TIME);
  }
}

export function snapshotTask(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TaskError(ErrorCode.INVALID_TASK);
  }
  const { id, title, completed, createdAtMs } = value;
  assertId(id);
  if (validateTitle(title) !== title) throw new TaskError(ErrorCode.INVALID_TITLE);
  if (typeof completed !== 'boolean') throw new TaskError(ErrorCode.INVALID_STATE);
  if (createdAtMs !== null) assertTime(createdAtMs);
  return Object.freeze({ id, title, completed, createdAtMs });
}

export function createTask(id, title, createdAtMs) {
  assertTime(createdAtMs);
  return snapshotTask({ id, title: validateTitle(title), completed: false, createdAtMs });
}

export function toggleTask(task) {
  const value = snapshotTask(task);
  return Object.freeze({ ...value, completed: !value.completed });
}

export function snapshotTasks(values) {
  if (!Array.isArray(values)) throw new TaskError(ErrorCode.INVALID_TASK);
  const tasks = Array.from(values, snapshotTask);
  if (new Set(tasks.map((task) => task.id)).size !== tasks.length) {
    throw new TaskError(ErrorCode.DUPLICATE_ID);
  }
  return Object.freeze(tasks);
}
