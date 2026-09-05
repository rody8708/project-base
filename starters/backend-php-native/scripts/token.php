<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';
require __DIR__.'/path-policy.php';

try {
    if (PHP_SAPI !== 'cli' || count($argv) < 4) throw new RuntimeException('Invalid arguments.');
    $issue = $argv[1] === 'issue';
    if (($issue && (count($argv) !== 7 || $argv[6] !== '--show-token'))
        || (!$issue && ($argv[1] !== 'revoke' || count($argv) !== 4))) throw new RuntimeException('Invalid arguments.');
    $requested = $argv[2];
    if ($requested === 'configured' && App\Infrastructure\SqlConnection::engine() !== 'sqlite') {
        $connection = App\Infrastructure\SqlConnection::open();
    } else {
        if (!preg_match('#\A(?:[A-Za-z]:[\\\\/]|/)#', $requested) || str_contains($requested, "\0")) throw new RuntimeException('Absolute path required.');
        $file = realpath($requested);
        if ($file === false || !is_file($file) || is_link($requested) || (stat($file)['nlink'] ?? 0) !== 1) throw new RuntimeException('Plain external database required.');
        $normalized = strtolower(str_replace('\\', '/', $file));
        $boundary = protectedBoundary();
        if (str_starts_with($normalized, $boundary.'/')) throw new RuntimeException('External database required.');
        $connection = new PDO('sqlite:'.$file);
    }
    $store = new App\Infrastructure\PdoTokenAuthenticator($connection, static fn (): int => time());
    if ($issue) {
        $permissions = match ($argv[4]) {
            'read' => ['tasks:read'], 'read-write' => ['tasks:read', 'tasks:write'],
            default => throw new RuntimeException('Invalid permissions.'),
        };
        if (!preg_match('/\A[1-9][0-9]{0,4}\z/D', $argv[5])) throw new RuntimeException('Invalid lifetime.');
        $issuer = new App\Application\TokenIssuer($store, static fn (): string => random_bytes(32), static fn (): int => time());
        $issued = $issuer->issue($argv[3], $permissions, (int) $argv[5]);
        // Secret output is opt-in. The caller must protect stdout and retain only the hash for revocation.
        echo json_encode($issued, JSON_THROW_ON_ERROR)."\n";
    } else {
        if (!preg_match('/\A[0-9a-f]{64}\z/D', $argv[3])) throw new RuntimeException('Token hash required.');
        $store->revoke($argv[3]);
        echo "PASS token revocation requested\n";
    }
} catch (Throwable) {
    fwrite(STDERR, "Token operation failed. Check the external migrated database, subject, permission profile and lifetime (1..86400 seconds). Issuance requires --show-token.\n");
    exit(1);
}
