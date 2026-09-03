<?php
declare(strict_types=1);

namespace App\Application;

use App\Domain\Task;
use App\Domain\TaskConflict;
use App\Domain\TaskNotFound;
use App\Domain\TaskValidationFailed;
use Closure;

final readonly class TaskService
{
    public function __construct(private TaskRepository $tasks, private Closure $newId) {}

    public function create(string $title): Task
    {
        $task = new Task(($this->newId)(), $title);
        $this->tasks->insert($task);
        return $task;
    }

    public function get(string $id): Task
    {
        Task::assertId($id);
        return $this->tasks->find($id) ?? throw new TaskNotFound();
    }

    /** @return list<Task> */
    public function list(int $limit, ?string $after): array
    {
        if ($limit < 1 || $limit > 100) throw new TaskValidationFailed('invalid_limit');
        if ($after !== null) Task::assertId($after);
        return $this->tasks->list($limit, $after);
    }

    public function replace(string $id, string $title, bool $completed, int $expectedVersion): Task
    {
        $current = $this->get($id);
        if ($current->version !== $expectedVersion) throw new TaskConflict();
        $updated = new Task($id, $title, $completed, $expectedVersion + 1);
        if (!$this->tasks->replaceIfVersion($updated, $expectedVersion)) throw new TaskConflict();
        return $updated;
    }

    public function delete(string $id, int $expectedVersion): void
    {
        $current = $this->get($id);
        if ($current->version !== $expectedVersion || !$this->tasks->deleteIfVersion($id, $expectedVersion)) {
            throw new TaskConflict();
        }
    }
}
