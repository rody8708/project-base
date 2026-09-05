<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use PDO;

final readonly class ServerMigrations
{
    public function __construct(private PDO $database) {}

    public function up(): void
    {
        $engine = $this->database->getAttribute(PDO::ATTR_DRIVER_NAME);
        if (!in_array($engine, ['pgsql', 'mysql'], true)) throw new \InvalidArgumentException('Server SQL required.');
        $mysql = $engine === 'mysql';
        if ($mysql) {
            if ((int) $this->database->query("SELECT GET_LOCK('native_schema_migrations', 10)")->fetchColumn() !== 1) throw new \RuntimeException('Migration lock unavailable.');
        } else {
            $this->database->beginTransaction();
            $this->database->query('SELECT pg_advisory_xact_lock(819503001)')->closeCursor();
        }
        try {
            $this->database->exec('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(96) PRIMARY KEY, sha256 VARCHAR(64) NOT NULL)');
            $name = '001_schema.sql';
            $sql = file_get_contents(dirname(__DIR__, 2).'/database/'.$engine.'/'.$name);
            if ($sql === false) throw new \RuntimeException('Migration missing.');
            $checksum = hash('sha256', str_replace("\r\n", "\n", $sql));
            $query = $this->database->prepare('SELECT sha256 FROM schema_migrations WHERE name = ?');
            $query->execute([$name]);
            $stored = $query->fetchColumn(); $query->closeCursor();
            if ($stored !== false && !hash_equals($stored, $checksum)) throw new \RuntimeException('Migration checksum mismatch.');
            if ($stored === false) {
                // MySQL DDL commits implicitly. Idempotent initial statements plus
                // the advisory lock allow replay after interruption, not rollback.
                foreach (explode(';', $sql) as $statement) if (trim($statement) !== '') $this->database->exec($statement);
                $this->database->prepare('INSERT INTO schema_migrations (name, sha256) VALUES (?, ?)')->execute([$name, $checksum]);
            }
            if (!$mysql) $this->database->commit();
        } catch (\Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        } finally {
            if ($mysql) $this->database->query("SELECT RELEASE_LOCK('native_schema_migrations')")->closeCursor();
        }
    }
}
