<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Infrastructure;

use App\Application\IdentityContext;
use App\Application\PersistenceUnavailable;
use App\Application\TaskRepository;
use App\Domain\Task;
use PDO;
use PDOException;
use PDOStatement;

/** Shared prepared SQL verified against the supported engine profiles. */
readonly class PdoTaskRepository implements TaskRepository
{
    public function __construct(private PDO $database, private IdentityContext $identity)
    {
        if (!in_array($database->getAttribute(PDO::ATTR_DRIVER_NAME), ['sqlite', 'pgsql', 'mysql'], true)) {
            throw new \InvalidArgumentException('Supported SQL connection required.');
        }
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    private function execute(string $sql, array $parameters): PDOStatement
    {
        try {
            $statement = $this->database->prepare($sql);
            foreach ($parameters as $key => $value) {
                $statement->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $statement->execute();
            return $statement;
        } catch (PDOException $error) {
            throw new PersistenceUnavailable($error);
        }
    }

    private function decode(array $row): Task
    {
        return new Task($row['id'], $row['title'], (bool) $row['completed'], (int) $row['version']);
    }

    public function find(string $id): ?Task
    {
        Task::assertId($id);
        $row = $this->execute('SELECT id, title, completed, version FROM tasks WHERE owner_id = :owner AND id = :id',
            [':owner' => $this->identity->require('tasks:read'), ':id' => $id])->fetch(PDO::FETCH_ASSOC);
        return $row === false ? null : $this->decode($row);
    }

    public function list(int $limit, ?string $after): array
    {
        if ($limit < 1 || $limit > 100) throw new \InvalidArgumentException('Invalid limit.');
        if ($after !== null) Task::assertId($after);
        $rows = $this->execute('SELECT id, title, completed, version FROM tasks WHERE owner_id = :owner AND id > :after ORDER BY id LIMIT :limit',
            [':owner' => $this->identity->require('tasks:read'), ':after' => $after ?? '', ':limit' => $limit])->fetchAll(PDO::FETCH_ASSOC);
        return array_map($this->decode(...), $rows);
    }

    public function insert(Task $task): void
    {
        $this->execute('INSERT INTO tasks (id, owner_id, title, completed, version) VALUES (:id, :owner, :title, :completed, :version)',
            [':id' => $task->id, ':owner' => $this->identity->require('tasks:write'), ':title' => $task->title,
                ':completed' => (int) $task->completed, ':version' => $task->version]);
    }

    public function replaceIfVersion(Task $task, int $expectedVersion): bool
    {
        return $this->execute('UPDATE tasks SET title = :title, completed = :completed, version = :version WHERE id = :id AND owner_id = :owner AND version = :expected',
            [':id' => $task->id, ':owner' => $this->identity->require('tasks:write'), ':title' => $task->title,
                ':completed' => (int) $task->completed, ':version' => $task->version, ':expected' => $expectedVersion])->rowCount() === 1;
    }

    public function deleteIfVersion(string $id, int $expectedVersion): bool
    {
        Task::assertId($id);
        return $this->execute('DELETE FROM tasks WHERE id = :id AND owner_id = :owner AND version = :expected',
            [':id' => $id, ':owner' => $this->identity->require('tasks:write'), ':expected' => $expectedVersion])->rowCount() === 1;
    }
}
