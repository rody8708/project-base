<?php
declare(strict_types=1);

namespace App\Infrastructure;

use App\Application\TaskRepository;
use App\Domain\Task;
use Illuminate\Database\DatabaseManager;

final readonly class SqlTaskRepository implements TaskRepository
{
    public function __construct(private DatabaseManager $database, private \App\Application\IdentityContext $identity) {}

    private function decode(object $row): Task
    {
        return new Task($row->id, $row->title, (bool) $row->completed, (int) $row->version);
    }

    public function find(string $id): ?Task
    {
        Task::assertId($id);
        $row = $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:read'))->where('id', $id)->first();
        return $row === null ? null : $this->decode($row);
    }

    public function list(int $limit, ?string $after): array
    {
        $query = $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:read'))->orderBy('id')->limit($limit);
        if ($after !== null) $query->where('id', '>', $after);
        return $query->get()->map(fn (object $row) => $this->decode($row))->all();
    }

    public function insert(Task $task): void
    {
        $this->database->table('tasks')->insert([...$task->toArray(), 'owner_id' => $this->identity->require('tasks:write')]);
    }

    public function replaceIfVersion(Task $task, int $expectedVersion): bool
    {
        return $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:write'))->where('id', $task->id)->where('version', $expectedVersion)
            ->update(['title' => $task->title, 'completed' => $task->completed, 'version' => $task->version]) === 1;
    }

    public function deleteIfVersion(string $id, int $expectedVersion): bool
    {
        Task::assertId($id);
        return $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:write'))->where('id', $id)->where('version', $expectedVersion)->delete() === 1;
    }
}
