<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

require dirname(__DIR__).'/bootstrap.php';

use App\Application\AccessDenied;
use App\Application\IdentityContext;
use App\Application\PersistenceUnavailable;
use App\Application\Principal;
use App\Application\TaskRepository;
use App\Application\TaskService;
use App\Domain\Task;
use App\Domain\TaskConflict;
use App\Domain\TaskNotFound;
use App\Domain\TaskValidationFailed;
use App\Infrastructure\SqliteTaskRepository;

function check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

function rejects(string $type, Closure $operation): void
{
    try { $operation(); } catch (Throwable $error) {
        check($error instanceof $type, 'Unexpected exception: '.$error::class);
        return;
    }
    throw new RuntimeException('Expected '.$type);
}

final class MemoryTasks implements TaskRepository
{
    private array $tasks = [];
    public function find(string $id): ?Task { return $this->tasks[$id] ?? null; }
    public function list(int $limit, ?string $after): array
    {
        ksort($this->tasks);
        return array_slice(array_values(array_filter($this->tasks, static fn (Task $task): bool => $after === null || strcmp($task->id, $after) > 0)), 0, $limit);
    }
    public function insert(Task $task): void { $this->tasks[$task->id] = $task; }
    public function replaceIfVersion(Task $task, int $expectedVersion): bool
    {
        if (($this->tasks[$task->id]->version ?? null) !== $expectedVersion) return false;
        $this->tasks[$task->id] = $task;
        return true;
    }
    public function deleteIfVersion(string $id, int $expectedVersion): bool
    {
        if (($this->tasks[$id]->version ?? null) !== $expectedVersion) return false;
        unset($this->tasks[$id]);
        return true;
    }
}

$id = '00000000-0000-4000-8000-000000000001';
$next = '00000000-0000-4000-8000-000000000002';
$unit = new TaskService(new MemoryTasks(), static fn (): string => $id);
$task = $unit->create('  Español ñ  ');
check($task->title === 'Español ñ', 'Unicode normalization');
check($unit->replace($id, 'Updated', true, 1)->version === 2, 'Unit update');
rejects(TaskConflict::class, static fn () => $unit->delete($id, 1));
$unit->delete($id, 2);
rejects(TaskNotFound::class, static fn () => $unit->get($id));
foreach (['', "line\nbreak", str_repeat('ñ', 81), "\xff"] as $invalid) {
    rejects(TaskValidationFailed::class, static fn () => $unit->create($invalid));
}
check(mb_strlen($unit->create(str_repeat('ñ', 80))->title) === 80, 'Unicode limit');
rejects(TaskValidationFailed::class, static fn () => $unit->list(101, null));
rejects(TaskValidationFailed::class, static fn () => $unit->list(1, 'invalid'));

// Isolated integration database: no environment configuration or disk state.
$database = new PDO('sqlite::memory:');
$database->exec(file_get_contents(dirname(__DIR__).'/database/001_tasks.sql'));
$identity = new IdentityContext();
$repository = new SqliteTaskRepository($database, $identity);
$service = new TaskService($repository, static fn (): string => $id);
rejects(AccessDenied::class, static fn () => $service->list(10, null));
rejects(AccessDenied::class, static fn () => $service->create('Denied'));
$identity->set(new Principal('owner-a', ['tasks:read', 'tasks:write'], 'synthetic'));
$service->create("ñ ' OR 1=1 --");
$repository->insert(new Task($next, 'Second'));
check(count($service->list(1, null)) === 1, 'Bound limit');
check($service->list(10, $id)[0]->id === $next, 'Cursor ordering');
check($service->get($id)->title === "ñ ' OR 1=1 --", 'SQL data stays data');
$identity->set(new Principal('owner-b', ['tasks:read', 'tasks:write'], 'synthetic'));
check($service->list(10, null) === [], 'Owner list isolation');
rejects(TaskNotFound::class, static fn () => $service->get($id));
check(!$repository->replaceIfVersion(new Task($id, 'Attack', true, 2), 1), 'Owner update isolation');
check(!$repository->deleteIfVersion($id, 1), 'Owner delete isolation');
$identity->set(new Principal('owner-a', ['tasks:read'], 'synthetic'));
rejects(AccessDenied::class, static fn () => $service->replace($id, 'Denied', true, 1));
rejects(AccessDenied::class, static fn () => $service->delete($id, 1));
$identity->set(new Principal('owner-a', ['tasks:read', 'tasks:write'], 'synthetic'));
check($service->replace($id, 'Updated', true, 1)->version === 2, 'SQL update');
check(!$repository->replaceIfVersion(new Task($id, 'Stale', false, 2), 1), 'Atomic stale update');
check(!$repository->deleteIfVersion($id, 1), 'Atomic stale delete');
rejects(TaskConflict::class, static fn () => $service->replace($id, 'Stale', false, 1));
$service->delete($id, 2);
rejects(TaskNotFound::class, static fn () => $service->get($id));
$database->exec('DROP TABLE tasks');
rejects(PersistenceUnavailable::class, static fn () => $service->list(10, null));
echo "PASS native PHP domain, application and isolated SQLite checks\n";
