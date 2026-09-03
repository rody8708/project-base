<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Unit;

use App\Infrastructure\SqliteRecovery;
use PDO;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class SqliteRecoveryTest extends TestCase
{
    private string $directory;
    private ?PDO $db = null;
    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir().DIRECTORY_SEPARATOR.'foundation-recovery-test-'.bin2hex(random_bytes(8));
        mkdir($this->directory, 0700);
        $this->db = new PDO('sqlite:'.$this->directory.'/source.sqlite');
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->exec('PRAGMA journal_mode=WAL');
        $this->db->exec('CREATE TABLE tasks(id TEXT PRIMARY KEY, title TEXT); CREATE TABLE api_tokens(id TEXT, revoked_at INTEGER); CREATE TABLE cache(key TEXT); CREATE TABLE cache_locks(key TEXT)');
        $this->db->exec("INSERT INTO tasks VALUES('one','Original'); INSERT INTO api_tokens VALUES('synthetic-hash',NULL); INSERT INTO cache VALUES('old'); INSERT INTO cache_locks VALUES('old')");
    }
    protected function tearDown(): void
    {
        $this->db = null;
        if (is_link($this->directory) || realpath(dirname($this->directory)) !== realpath(sys_get_temp_dir())
            || !str_starts_with(basename($this->directory), 'foundation-recovery-test-')) throw new RuntimeException('Unsafe test cleanup.');
        $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->directory, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($files as $file) {
            if ($file->isDir() && !$file->isLink()) rmdir($file->getPathname()); else unlink($file->getPathname());
        }
        rmdir($this->directory);
    }
    public function test_wal_snapshot_restores_committed_data_and_invalidates_credentials_without_changing_source(): void
    {
        $recovery = new SqliteRecovery();
        $manifest = $recovery->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot');
        self::assertSame($manifest, $recovery->verify($this->directory.'/snapshot'));
        $this->db->exec("UPDATE tasks SET title='After snapshot'; UPDATE api_tokens SET revoked_at=123");
        $report = $recovery->restore($this->directory.'/snapshot', $this->directory.'/restored.sqlite');
        $restored = new PDO('sqlite:'.$this->directory.'/restored.sqlite');
        self::assertSame('Original', $restored->query('SELECT title FROM tasks')->fetchColumn());
        self::assertSame('After snapshot', $this->db->query('SELECT title FROM tasks')->fetchColumn());
        self::assertNotNull($restored->query('SELECT revoked_at FROM api_tokens')->fetchColumn());
        self::assertSame(0, (int) $restored->query('SELECT count(*) FROM cache')->fetchColumn());
        self::assertSame(0, (int) $restored->query('SELECT count(*) FROM cache_locks')->fetchColumn());
        self::assertSame('RESTORED_NOT_ACTIVATED', $report['result']);
        self::assertSame(1, $report['credentialsInvalidated']);
        self::assertNotSame($report['sourceSha256'], $report['restoredSha256']);
        self::assertSame($manifest, $recovery->verify($this->directory.'/snapshot'));
        $restored = null;
    }
    public function test_restore_never_overwrites_an_existing_file(): void
    {
        $recovery = new SqliteRecovery();
        $recovery->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot');
        file_put_contents($this->directory.'/existing.sqlite', 'preserve');
        try { $recovery->restore($this->directory.'/snapshot', $this->directory.'/existing.sqlite'); self::fail('Overwrite accepted'); }
        catch (RuntimeException) { self::assertSame('preserve', file_get_contents($this->directory.'/existing.sqlite')); }
    }
    public function test_snapshot_never_reuses_an_existing_directory(): void
    {
        mkdir($this->directory.'/existing');
        $this->expectException(RuntimeException::class);
        (new SqliteRecovery())->snapshot($this->directory.'/source.sqlite', $this->directory.'/existing');
    }
    public function test_corrupted_backup_is_rejected_before_destination_creation(): void
    {
        $recovery = new SqliteRecovery();
        $recovery->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot');
        file_put_contents($this->directory.'/snapshot/database.sqlite', 'corrupt', FILE_APPEND);
        try { $recovery->restore($this->directory.'/snapshot', $this->directory.'/restored.sqlite'); self::fail('Corruption accepted'); }
        catch (RuntimeException) { self::assertFileDoesNotExist($this->directory.'/restored.sqlite'); }
    }
    public function test_manifest_cannot_redirect_to_another_file(): void
    {
        $recovery = new SqliteRecovery();
        $recovery->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot');
        file_put_contents($this->directory.'/snapshot/manifest.json', '{"format":1,"engine":"other","sha256":"bad"}');
        $this->expectException(RuntimeException::class);
        $recovery->verify($this->directory.'/snapshot');
    }
    public function test_foreign_key_violations_do_not_publish_a_valid_snapshot(): void
    {
        $this->db->exec('CREATE TABLE parent(id INTEGER PRIMARY KEY); CREATE TABLE child(id INTEGER REFERENCES parent(id)); INSERT INTO child VALUES(9)');
        try { (new SqliteRecovery())->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot'); self::fail('Foreign key violation accepted'); }
        catch (RuntimeException) { self::assertFileDoesNotExist($this->directory.'/snapshot/manifest.json'); }
    }
    public function test_incomplete_backup_is_not_accepted(): void
    {
        mkdir($this->directory.'/incomplete');
        $this->expectException(RuntimeException::class);
        (new SqliteRecovery())->verify($this->directory.'/incomplete');
    }

    public function test_uncommitted_wal_writes_are_not_included(): void
    {
        $this->db->beginTransaction();
        $this->db->exec("INSERT INTO tasks VALUES('uncommitted','Not committed')");
        try {
            (new SqliteRecovery())->snapshot($this->directory.'/source.sqlite', $this->directory.'/snapshot');
            $snapshot = new PDO('sqlite:'.$this->directory.'/snapshot/database.sqlite');
            self::assertSame(1, (int) $snapshot->query('SELECT count(*) FROM tasks')->fetchColumn());
            $snapshot = null;
        } finally { $this->db->rollBack(); }
    }

    public function test_reserved_destination_name_is_rejected_on_every_platform(): void
    {
        $this->expectException(RuntimeException::class);
        (new SqliteRecovery())->snapshot($this->directory.'/source.sqlite', $this->directory.'/CON');
    }
}
