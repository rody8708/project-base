// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
export type WireTask = Readonly<{ id: string; title: string; completed: boolean; version: number }>;
export class ApiFailure extends Error { code: string; constructor(code: string); }
export function decodeTask(value: unknown): WireTask;
export function createTaskApi(url: string, fetcher?: typeof fetch, timeoutMs?: number, tokenProvider?: () => string | null): {
  list(): Promise<readonly WireTask[]>;
  create(title: string): Promise<WireTask>;
  replace(task: WireTask, completed: boolean): Promise<WireTask>;
};
