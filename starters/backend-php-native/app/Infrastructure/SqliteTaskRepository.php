<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

// Retains the explicit SQLite boundary for existing consumers and tests.
final readonly class SqliteTaskRepository extends PdoTaskRepository
{
    public function __construct(\PDO $database, \App\Application\IdentityContext $identity)
    {
        if ($database->getAttribute(\PDO::ATTR_DRIVER_NAME) !== 'sqlite') throw new \InvalidArgumentException('SQLite required.');
        parent::__construct($database, $identity);
    }
}
