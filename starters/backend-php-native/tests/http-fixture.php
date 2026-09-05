<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';

// Only the test harness supplies a new temporary destination and random tokens.
$file = getenv('NATIVE_PHP_DATABASE');
if (!is_string($file) || file_exists($file) || realpath(dirname($file)) === false) throw new RuntimeException('New fixture required.');
$database = new PDO('sqlite:'.$file);
(new App\Infrastructure\SqliteMigrations($database))->up();
$query = $database->prepare('INSERT INTO api_tokens (id, subject, permissions, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?)');
foreach (['OWNER', 'OTHER', 'READER', 'EXPIRED', 'REVOKED'] as $kind) {
    $token = getenv('TEST_TOKEN_'.$kind);
    if (!is_string($token) || !preg_match('/\A[0-9a-f]{64}\z/D', $token)) throw new RuntimeException('Synthetic token required.');
    $now = time();
    $query->execute([hash('sha256', $token), $kind === 'OTHER' ? 'owner-b' : 'owner-a',
        json_encode($kind === 'READER' ? ['tasks:read'] : ['tasks:read', 'tasks:write'], JSON_THROW_ON_ERROR),
        $now - 100, $kind === 'EXPIRED' ? $now - 1 : $now + 3600, $kind === 'REVOKED' ? $now : null]);
}
