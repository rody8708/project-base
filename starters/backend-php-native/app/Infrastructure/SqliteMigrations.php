<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use PDO;

final readonly class SqliteMigrations
{
    public function __construct(private PDO $database)
    {
        if ($database->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') throw new \InvalidArgumentException('SQLite required.');
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function up(): void
    {
        $this->database->beginTransaction();
        try {
            $this->database->exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY NOT NULL, sha256 TEXT NOT NULL)');
            foreach (['001_tasks.sql', '002_tokens.sql', '003_rate_limits.sql'] as $name) {
                $sql = file_get_contents(dirname(__DIR__, 2).'/database/'.$name);
                if ($sql === false) throw new \RuntimeException('Migration missing.');
                $checksum = hash('sha256', str_replace("\r\n", "\n", $sql));
                $lookup = $this->database->prepare('SELECT sha256 FROM schema_migrations WHERE name = ?');
                $lookup->execute([$name]);
                $stored = $lookup->fetchColumn();
                $lookup->closeCursor();
                if ($stored !== false) {
                    if (!hash_equals($stored, $checksum)) throw new \RuntimeException('Migration checksum mismatch.');
                    continue;
                }
                $this->database->exec($sql);
                $insert = $this->database->prepare('INSERT INTO schema_migrations (name, sha256) VALUES (?, ?)');
                $insert->execute([$name, $checksum]);
            }
            $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }
}
