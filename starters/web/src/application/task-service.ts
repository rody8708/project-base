import { createTask, failure, toggleTask, validateTitle } from '../domain/task';
import type { Result, Task } from '../domain/task';

export interface TaskRepository {
  list(): Promise<Result<readonly Task[]>>;
  add(task: Task): Promise<Result<Task>>;
  // Transform the last observed value. Remote adapters use its version; failures
  // can have an unknown commit outcome and must not trigger automatic retries.
  update(id: string, transform: (current: Task) => Task): Promise<Result<Task>>;
}

export interface TaskService {
  list(): Promise<Result<readonly Task[]>>;
  add(title: unknown): Promise<Result<Task>>;
  toggle(id: string): Promise<Result<Task>>;
}

export function createTaskService(dependencies: Readonly<{
  repository: TaskRepository;
  nextId: () => string;
  now: () => number;
}>): TaskService {
  const { repository, nextId, now } = dependencies;

  async function storage<T>(operation: () => Promise<Result<T>>): Promise<Result<T>> {
    try {
      return await operation();
    } catch {
      // Do not leak adapter exceptions or automatically repeat uncertain effects.
      return failure('STORAGE_UNAVAILABLE');
    }
  }

  return {
    list: () => storage(() => repository.list()),
    async add(input) {
      const title = validateTitle(input);
      if (!title.ok) return title;
      let task: Result<Task>;
      try {
        task = createTask({ id: nextId(), title: title.value, createdAtEpochMs: now() });
      } catch {
        return failure('DEPENDENCY_FAILURE');
      }
      if (!task.ok) return task;
      return storage(() => repository.add(task.value));
    },
    toggle: (id) => storage(() => repository.update(id, toggleTask)),
  };
}
