// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import type { TaskErrorCode } from '../../domain/task';

export type Locale = 'es-419' | 'en-US';

export interface Messages {
  readonly pageTitle: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly introduction: string;
  readonly language: string;
  readonly inputLabel: string;
  readonly inputHint: string;
  readonly inputPlaceholder: string;
  readonly add: string;
  readonly working: string;
  readonly loading: string;
  readonly emptyTitle: string;
  readonly emptyBody: string;
  readonly listLabel: string;
  readonly pending: string;
  readonly completed: string;
  readonly retry: string;
  readonly memoryNotice: string;
  readonly remoteNotice: string;
  readonly architecture: string;
  readonly architectureBody: string;
  readonly candidate: string;
  readonly summary: (total: number, completed: number) => string;
  readonly errors: Readonly<Record<TaskErrorCode, string>>;
}
