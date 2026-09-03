<?php
declare(strict_types=1);

namespace App\Application;

use App\Domain\Task;

interface TaskRepository
{
    public function find(string $id): ?Task;
    /** @return list<Task> */
    public function list(int $limit, ?string $after): array;
    public function insert(Task $task): void;
    public function replaceIfVersion(Task $task, int $expectedVersion): bool;
    public function deleteIfVersion(string $id, int $expectedVersion): bool;
}
