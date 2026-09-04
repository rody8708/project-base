<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Infrastructure;

use App\Application\PersistenceUnavailable;
use App\Application\TaskRepository;
use App\Domain\Task;
use Closure;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\QueryException;

final readonly class SqlTaskRepository implements TaskRepository
{
    public function __construct(private DatabaseManager $database, private \App\Application\IdentityContext $identity) {}

    private function decode(object $row): Task
    {
        return new Task($row->id, $row->title, (bool) $row->completed, (int) $row->version);
    }

    private function query(Closure $operation): mixed
    {
        try {
            return $operation();
        } catch (QueryException $error) {
            throw new PersistenceUnavailable($error);
        }
    }

    public function find(string $id): ?Task
    {
        Task::assertId($id);
        $row = $this->query(fn () => $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:read'))->where('id', $id)->first());
        return $row === null ? null : $this->decode($row);
    }

    public function list(int $limit, ?string $after): array
    {
        return $this->query(function () use ($limit, $after): array {
            $query = $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:read'))->orderBy('id')->limit($limit);
            if ($after !== null) $query->where('id', '>', $after);
            return $query->get()->map(fn (object $row) => $this->decode($row))->all();
        });
    }

    public function insert(Task $task): void
    {
        $this->query(fn () => $this->database->table('tasks')->insert([...$task->toArray(), 'owner_id' => $this->identity->require('tasks:write')]));
    }

    public function replaceIfVersion(Task $task, int $expectedVersion): bool
    {
        return $this->query(fn () => $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:write'))->where('id', $task->id)->where('version', $expectedVersion)
            ->update(['title' => $task->title, 'completed' => $task->completed, 'version' => $task->version]) === 1);
    }

    public function deleteIfVersion(string $id, int $expectedVersion): bool
    {
        Task::assertId($id);
        return $this->query(fn () => $this->database->table('tasks')->where('owner_id', $this->identity->require('tasks:write'))->where('id', $id)->where('version', $expectedVersion)->delete() === 1);
    }
}
