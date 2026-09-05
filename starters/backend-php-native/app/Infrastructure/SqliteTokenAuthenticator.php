<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

// Retains the explicit SQLite boundary for existing consumers and tests.
final readonly class SqliteTokenAuthenticator extends PdoTokenAuthenticator
{
    public function __construct(\PDO $database, \Closure $now)
    {
        if ($database->getAttribute(\PDO::ATTR_DRIVER_NAME) !== 'sqlite') throw new \InvalidArgumentException('SQLite required.');
        parent::__construct($database, $now);
    }
}
