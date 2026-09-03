<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Infrastructure;

use PDO;
use RuntimeException;

/** SQLite adapter for this starter's recovery profile. Never replaces a live database. */
final class SqliteRecovery
{
    private function existingFile(string $path): string
    {
        $resolved = realpath($path);
        if ($resolved === false || !is_file($path) || is_link($path) || (stat($path)['nlink'] ?? 0) !== 1) {
            throw new RuntimeException('Expected a regular, non-linked database file.');
        }
        return $resolved;
    }

    private function newPath(string $path): string
    {
        $parent = realpath(dirname($path));
        if ($parent === false || !is_dir($parent) || is_link(dirname($path)) || file_exists($path) || is_link($path)
            || !preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}\z/D', basename($path))
            || str_ends_with(basename($path), '.') || preg_match('/\A(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i', basename($path))) {
            throw new RuntimeException('Use a new destination in an existing private directory.');
        }
        return $parent.DIRECTORY_SEPARATOR.basename($path);
    }

    private function open(string $path, bool $readOnly = true): PDO
    {
        $db = new PDO('sqlite:'.$path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            \Pdo\Sqlite::ATTR_OPEN_FLAGS => $readOnly ? \Pdo\Sqlite::OPEN_READONLY : \Pdo\Sqlite::OPEN_READWRITE]);
        $db->exec('PRAGMA busy_timeout=5000');
        return $db;
    }

    private function integrity(PDO $db): void
    {
        if ($db->query('PRAGMA integrity_check')->fetchAll(PDO::FETCH_COLUMN) !== ['ok']
            || $db->query('PRAGMA foreign_key_check')->fetchAll() !== []) {
            throw new RuntimeException('Database integrity verification failed.');
        }
    }

    public function snapshot(string $source, string $destination): array
    {
        $source = $this->existingFile($source);
        $destination = $this->newPath($destination);
        if (!mkdir($destination, 0700)) throw new RuntimeException('Cannot reserve snapshot directory.');
        $start = hrtime(true);
        $db = $this->open($source);
        $backup = $destination.DIRECTORY_SEPARATOR.'database.sqlite';
        // VACUUM INTO takes a consistent SQLite snapshot, including committed WAL data.
        $db->exec('VACUUM INTO '.$db->quote($backup));
        $db = null;
        chmod($backup, 0600);
        $this->integrity($this->open($backup));
        $handle = fopen($backup, 'r+b');
        if ($handle === false) throw new RuntimeException('Snapshot flush failed.');
        try { if (!fsync($handle)) throw new RuntimeException('Snapshot flush failed.'); } finally { fclose($handle); }
        $manifest = ['format' => 1, 'engine' => 'sqlite', 'createdAt' => gmdate('c'),
            'sha256' => hash_file('sha256', $backup), 'bytes' => filesize($backup),
            'snapshotMs' => round((hrtime(true) - $start) / 1e6, 3)];
        $encoded = json_encode($manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
        $handle = fopen($destination.DIRECTORY_SEPARATOR.'manifest.json', 'x+b');
        if ($handle === false) throw new RuntimeException('Cannot publish snapshot manifest.');
        try {
            if (fwrite($handle, $encoded) !== strlen($encoded) || !fflush($handle) || !fsync($handle)) {
                throw new RuntimeException('Cannot publish snapshot manifest.');
            }
        } finally { fclose($handle); }
        return $manifest;
    }

    public function verify(string $directory): array
    {
        if (is_link($directory)) throw new RuntimeException('Linked snapshot directory rejected.');
        $manifestFile = $this->existingFile($directory.DIRECTORY_SEPARATOR.'manifest.json');
        if (filesize($manifestFile) > 4096) throw new RuntimeException('Invalid manifest size.');
        $manifest = json_decode(file_get_contents($manifestFile), true, 8, JSON_THROW_ON_ERROR);
        $backup = $this->existingFile($directory.DIRECTORY_SEPARATOR.'database.sqlite');
        if (($manifest['format'] ?? null) !== 1 || ($manifest['engine'] ?? null) !== 'sqlite'
            || !is_string($manifest['sha256'] ?? null) || !preg_match('/\A[0-9a-f]{64}\z/D', $manifest['sha256'])
            || ($manifest['bytes'] ?? null) !== filesize($backup)
            || !hash_equals($manifest['sha256'], hash_file('sha256', $backup))) {
            throw new RuntimeException('Snapshot checksum or format mismatch.');
        }
        $this->integrity($this->open($backup));
        return $manifest;
    }

    public function restore(string $directory, string $destination): array
    {
        $start = hrtime(true);
        $manifest = $this->verify($directory);
        $destination = $this->newPath($destination);
        $output = fopen($destination, 'x+b');
        if ($output === false) throw new RuntimeException('Cannot reserve restore destination.');
        chmod($destination, 0600);
        $input = fopen($directory.DIRECTORY_SEPARATOR.'database.sqlite', 'rb');
        try {
            if ($input === false || stream_copy_to_stream($input, $output) !== $manifest['bytes'] || !fflush($output) || !fsync($output)) {
                throw new RuntimeException('Restore copy failed; quarantine the new file.');
            }
        } finally { if (is_resource($input)) fclose($input); fclose($output); }
        if (!hash_equals($manifest['sha256'], hash_file('sha256', $destination))) {
            throw new RuntimeException('Restored checksum mismatch; quarantine the new file.');
        }
        $db = $this->open($destination, false);
        $this->integrity($db);
        // Restoring an old backup must never resurrect expired/revoked credentials.
        // No token is valid after recovery; the operator provisions fresh credentials.
        $db->beginTransaction();
        try {
            $revoked = $db->exec('UPDATE api_tokens SET revoked_at='.time());
            $db->exec('DELETE FROM cache');
            $db->exec('DELETE FROM cache_locks');
            $db->commit();
        } catch (\Throwable $error) { $db->rollBack(); throw $error; }
        $this->integrity($db);
        $db = null;
        return ['result' => 'RESTORED_NOT_ACTIVATED', 'sourceSha256' => $manifest['sha256'],
            'restoredSha256' => hash_file('sha256', $destination), 'credentialsInvalidated' => $revoked,
            'restoreMs' => round((hrtime(true) - $start) / 1e6, 3)];
    }
}
