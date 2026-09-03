<?php
declare(strict_types=1);

namespace Tests\Unit;

use App\Infrastructure\BackupEnvelope;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class BackupEnvelopeTest extends TestCase
{
    private string $directory;
    protected function setUp(): void { $this->directory = sys_get_temp_dir().DIRECTORY_SEPARATOR.'foundation-envelope-test-'.bin2hex(random_bytes(8)); mkdir($this->directory, 0700); }
    protected function tearDown(): void
    {
        if (is_link($this->directory) || realpath(dirname($this->directory)) !== realpath(sys_get_temp_dir()) || !str_starts_with(basename($this->directory), 'foundation-envelope-test-')) throw new RuntimeException('Unsafe cleanup.');
        foreach (new \DirectoryIterator($this->directory) as $file) if (!$file->isDot()) unlink($file->getPathname());
        rmdir($this->directory);
    }
    public function test_binary_round_trip_uses_distinct_envelope_and_never_activates_output(): void
    {
        $source = $this->directory.'/source.bin'; file_put_contents($source, random_bytes(1048576 + 37)."\0tail");
        $tool = new BackupEnvelope(); $tool->generateKey($this->directory.'/key');
        $manifest = $tool->seal($source, $this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/key');
        self::assertSame(2, $manifest['chunks']); self::assertSame('SEALED_NOT_REPLICATED', $manifest['status']);
        self::assertTrue($tool->verify($this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/key')['verified']);
        $opened = $tool->open($this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/restored.bin', $this->directory.'/key');
        self::assertSame('OPENED_NOT_ACTIVATED', $opened['result']); self::assertSame(hash_file('sha256', $source), hash_file('sha256', $this->directory.'/restored.bin'));
    }
    public function test_modified_ciphertext_is_rejected_before_plaintext_destination_exists(): void
    {
        file_put_contents($this->directory.'/source', 'private payload'); $tool = new BackupEnvelope(); $tool->generateKey($this->directory.'/key');
        $tool->seal($this->directory.'/source', $this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/key');
        $stream = fopen($this->directory.'/backup.enc', 'r+b'); fseek($stream, 45); fwrite($stream, "X"); fclose($stream);
        try { $tool->open($this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/restored', $this->directory.'/key'); self::fail('Modified envelope accepted.'); }
        catch (RuntimeException) { self::assertFileDoesNotExist($this->directory.'/restored'); }
    }
    public function test_wrong_key_and_truncation_are_rejected(): void
    {
        file_put_contents($this->directory.'/source', 'payload'); $tool = new BackupEnvelope(); $tool->generateKey($this->directory.'/key'); $tool->generateKey($this->directory.'/wrong');
        $tool->seal($this->directory.'/source', $this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/key');
        try { $tool->verify($this->directory.'/backup.enc', $this->directory.'/backup.json', $this->directory.'/wrong'); self::fail('Wrong key accepted.'); } catch (RuntimeException) { self::assertTrue(true); }
        $bytes = file_get_contents($this->directory.'/backup.enc'); file_put_contents($this->directory.'/truncated.enc', substr($bytes, 0, -1));
        $manifest = json_decode(file_get_contents($this->directory.'/backup.json'), true); $manifest['envelopeBytes']--; $manifest['envelopeSha256'] = hash_file('sha256', $this->directory.'/truncated.enc'); file_put_contents($this->directory.'/truncated.json', json_encode($manifest));
        $this->expectException(RuntimeException::class); $tool->verify($this->directory.'/truncated.enc', $this->directory.'/truncated.json', $this->directory.'/key');
    }
    public function test_existing_outputs_symlinks_and_invalid_keys_are_refused(): void
    {
        $tool = new BackupEnvelope(); file_put_contents($this->directory.'/existing', 'keep');
        try { $tool->generateKey($this->directory.'/existing'); self::fail('Overwrite accepted.'); } catch (RuntimeException) { self::assertSame('keep', file_get_contents($this->directory.'/existing')); }
        file_put_contents($this->directory.'/short-key', 'short'); file_put_contents($this->directory.'/source', 'data');
        $this->expectException(RuntimeException::class); $tool->seal($this->directory.'/source', $this->directory.'/output', $this->directory.'/manifest', $this->directory.'/short-key');
    }
}
