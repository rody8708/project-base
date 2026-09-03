<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Infrastructure;

use RuntimeException;

final class BackupEnvelope
{
    private const MAGIC = "FNDENC01";
    private const FOOTER = "FNDEND01";
    private const CHUNK = 1048576;

    public function generateKey(string $target): array
    {
        $this->assertNewFile($target);
        $this->writeNew($target, random_bytes(32));
        return ['result' => 'KEY_CREATED', 'bytes' => 32];
    }

    public function seal(string $source, string $target, string $manifestPath, string $keyPath): array
    {
        $this->assertReadableRegular($source);
        $this->assertNewFile($target);
        $this->assertNewFile($manifestPath);
        $key = $this->key($keyPath);
        [$encKey, $macKey] = $this->keys($key);
        $input = fopen($source, 'rb');
        $output = @fopen($target, 'xb');
        if (!is_resource($input) || !is_resource($output)) throw new RuntimeException('Cannot reserve envelope.');
        $mac = hash_init('sha256', HASH_HMAC, $macKey);
        $header = self::MAGIC.pack('N', self::CHUNK);
        $this->put($output, $header); hash_update($mac, $header);
        $index = 0; $plainBytes = 0;
        try {
            while (!feof($input)) {
                $plain = fread($input, self::CHUNK);
                if ($plain === false) throw new RuntimeException('Source read failed.');
                if ($plain === '') break;
                $nonce = random_bytes(12);
                $aad = self::MAGIC.pack('N2', 0, $index);
                $tag = '';
                $cipher = openssl_encrypt($plain, 'aes-256-gcm', $encKey, OPENSSL_RAW_DATA, $nonce, $tag, $aad, 16);
                if ($cipher === false || strlen($tag) !== 16) throw new RuntimeException('Encryption failed.');
                $record = pack('N2N', 0, $index, strlen($cipher)).$nonce.$tag.$cipher;
                $this->put($output, $record); hash_update($mac, $record);
                $plainBytes += strlen($plain); $index++;
            }
            $footerPrefix = self::FOOTER.pack('N2', 0, $index);
            hash_update($mac, $footerPrefix);
            $this->put($output, $footerPrefix.hash_final($mac, true));
            if (!fflush($output)) throw new RuntimeException('Envelope flush failed.');
        } catch (\Throwable $error) {
            fclose($input); fclose($output); throw $error;
        }
        fclose($input); fclose($output);
        $manifest = [
            'format' => 1, 'algorithm' => 'AES-256-GCM-chunks+HMAC-SHA-256',
            'chunkBytes' => self::CHUNK, 'plainBytes' => $plainBytes, 'chunks' => $index,
            'envelopeBytes' => filesize($target), 'envelopeSha256' => hash_file('sha256', $target),
            'createdAt' => gmdate('c'), 'status' => 'SEALED_NOT_REPLICATED',
        ];
        $this->writeNew($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n");
        return $manifest;
    }

    public function verify(string $envelope, string $manifestPath, string $keyPath): array
    {
        $this->assertReadableRegular($envelope); $this->assertReadableRegular($manifestPath);
        $manifest = json_decode((string) file_get_contents($manifestPath), true, 16, JSON_THROW_ON_ERROR);
        if (($manifest['format'] ?? null) !== 1 || ($manifest['algorithm'] ?? null) !== 'AES-256-GCM-chunks+HMAC-SHA-256'
            || ($manifest['envelopeBytes'] ?? null) !== filesize($envelope)
            || !is_string($manifest['envelopeSha256'] ?? null)
            || !hash_equals($manifest['envelopeSha256'], hash_file('sha256', $envelope))) {
            throw new RuntimeException('Envelope manifest mismatch.');
        }
        $scan = $this->scan($envelope, $this->keys($this->key($keyPath))[1]);
        if (($manifest['chunks'] ?? null) !== $scan['chunks']) throw new RuntimeException('Chunk count mismatch.');
        return $manifest + ['verified' => true];
    }

    public function open(string $envelope, string $manifestPath, string $target, string $keyPath): array
    {
        $manifest = $this->verify($envelope, $manifestPath, $keyPath);
        $this->assertNewFile($target);
        [$encKey] = $this->keys($this->key($keyPath));
        $input = fopen($envelope, 'rb'); $output = @fopen($target, 'xb');
        if (!is_resource($input) || !is_resource($output)) throw new RuntimeException('Cannot reserve plaintext target.');
        try {
            if ($this->read($input, 12) !== self::MAGIC.pack('N', self::CHUNK)) throw new RuntimeException('Envelope header mismatch.');
            $plainBytes = 0;
            for ($index = 0; $index < $manifest['chunks']; $index++) {
                $prefix = $this->read($input, 12); $parts = unpack('Nhigh/Nlow/Nlength', $prefix);
                if ($parts['high'] !== 0 || $parts['low'] !== $index || $parts['length'] > self::CHUNK) throw new RuntimeException('Envelope record mismatch.');
                $nonce = $this->read($input, 12); $tag = $this->read($input, 16); $cipher = $this->read($input, $parts['length']);
                $plain = openssl_decrypt($cipher, 'aes-256-gcm', $encKey, OPENSSL_RAW_DATA, $nonce, $tag, self::MAGIC.pack('N2', 0, $index));
                if ($plain === false) throw new RuntimeException('Envelope authentication failed.');
                $this->put($output, $plain); $plainBytes += strlen($plain);
            }
            if ($plainBytes !== $manifest['plainBytes'] || !fflush($output)) throw new RuntimeException('Plaintext size or flush mismatch.');
        } catch (\Throwable $error) {
            fclose($input); fclose($output); throw $error;
        }
        fclose($input); fclose($output);
        return ['result' => 'OPENED_NOT_ACTIVATED', 'bytes' => $plainBytes, 'sha256' => hash_file('sha256', $target)];
    }

    private function scan(string $path, string $macKey): array
    {
        $stream = fopen($path, 'rb'); if (!is_resource($stream)) throw new RuntimeException('Envelope open failed.');
        $header = $this->read($stream, 12);
        if ($header !== self::MAGIC.pack('N', self::CHUNK)) throw new RuntimeException('Envelope header mismatch.');
        $mac = hash_init('sha256', HASH_HMAC, $macKey); hash_update($mac, $header); $index = 0;
        while (true) {
            $marker = $this->read($stream, 8);
            if ($marker === self::FOOTER) {
                $count = $this->read($stream, 8); $parts = unpack('Nhigh/Nlow', $count);
                if ($parts['high'] !== 0 || $parts['low'] !== $index) throw new RuntimeException('Envelope footer mismatch.');
                hash_update($mac, $marker.$count); $expected = hash_final($mac, true); $actual = $this->read($stream, 32);
                if (!hash_equals($expected, $actual) || fgetc($stream) !== false) throw new RuntimeException('Envelope authentication failed.');
                fclose($stream); return ['chunks' => $index];
            }
            $rest = $this->read($stream, 4); $prefix = $marker.$rest; $parts = unpack('Nhigh/Nlow/Nlength', $prefix);
            if ($parts['high'] !== 0 || $parts['low'] !== $index || $parts['length'] > self::CHUNK) throw new RuntimeException('Envelope record mismatch.');
            $record = $prefix.$this->read($stream, 28 + $parts['length']); hash_update($mac, $record); $index++;
        }
    }

    private function key(string $path): string { $this->assertReadableRegular($path); $key = file_get_contents($path); if ($key === false || strlen($key) !== 32) throw new RuntimeException('Key must be exactly 32 binary bytes.'); return $key; }
    private function keys(string $master): array { return [hash_hkdf('sha256', $master, 32, 'foundation-backup-encryption-v1'), hash_hkdf('sha256', $master, 32, 'foundation-backup-authentication-v1')]; }
    private function assertReadableRegular(string $path): void { if (is_link($path) || !is_file($path) || !is_readable($path)) throw new RuntimeException('Readable regular file required.'); }
    private function assertNewFile(string $path): void { if ($path === '' || file_exists($path) || is_link($path) || !is_dir(dirname($path)) || !is_writable(dirname($path))) throw new RuntimeException('New file in an existing writable directory required.'); }
    private function writeNew(string $path, string $bytes): void { $stream = @fopen($path, 'xb'); if (!is_resource($stream)) throw new RuntimeException('Cannot reserve output.'); try { $this->put($stream, $bytes); if (!fflush($stream)) throw new RuntimeException('Output flush failed.'); } finally { fclose($stream); } }
    private function put($stream, string $bytes): void { $offset = 0; while ($offset < strlen($bytes)) { $written = fwrite($stream, substr($bytes, $offset)); if ($written === false || $written === 0) throw new RuntimeException('Output write failed.'); $offset += $written; } }
    private function read($stream, int $length): string { $bytes = ''; while (strlen($bytes) < $length) { $part = fread($stream, $length - strlen($bytes)); if ($part === false || $part === '') throw new RuntimeException('Unexpected envelope end.'); $bytes .= $part; } return $bytes; }
}
