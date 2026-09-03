// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { createMemoryTaskRepository } from './adapters/memory-task-repository.js';
import { createHttpTaskRepository } from './adapters/http-task-repository.js';
import { API_BASE_URL } from './config.js';
import { createTaskService } from './application/task-service.js';
import { createTaskController } from './ui/task-controller.js';
import { createDomView } from './ui/dom-view.js';

const view = createDomView(document, Boolean(API_BASE_URL));
try {
  const service = createTaskService({
    repository: API_BASE_URL ? createHttpTaskRepository(API_BASE_URL) : createMemoryTaskRepository(),
    nextId: () => globalThis.crypto.randomUUID(),
    now: () => Date.now(),
  });
  const controller = createTaskController({ service, onChange: view.render, language: document.documentElement.lang });
  view.bind(controller);
  await controller.reload();
} catch {
  view.failStartup();
}
