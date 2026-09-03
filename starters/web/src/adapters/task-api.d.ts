export type WireTask = Readonly<{ id: string; title: string; completed: boolean; version: number }>;
export class ApiFailure extends Error { code: string; constructor(code: string); }
export function decodeTask(value: unknown): WireTask;
export function createTaskApi(url: string, fetcher?: typeof fetch, timeoutMs?: number, tokenProvider?: () => string | null): {
  list(): Promise<readonly WireTask[]>;
  create(title: string): Promise<WireTask>;
  replace(task: WireTask, completed: boolean): Promise<WireTask>;
};
