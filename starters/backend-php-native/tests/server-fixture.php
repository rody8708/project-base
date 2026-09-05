<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';

// Explicit synthetic fixture gate. No developer databases or environment files.
if (!preg_match('/\Anative_test_[0-9a-f]{12}\z/D', getenv('NATIVE_PHP_DB_NAME') ?: '')) throw new RuntimeException('Isolated database required.');
$db = App\Infrastructure\SqlConnection::open();
$migrations = new App\Infrastructure\ServerMigrations($db);
if (!isset($argv[1])) { $migrations->up(); $migrations->up(); }
if (($argv[1] ?? '') === 'limiter') {
    $limiter = new App\Infrastructure\ServerRateLimiter($db, static fn (): int => 1800000000, 5);
    echo $limiter->consume('synthetic-counter') === 0 ? 'accepted' : 'limited';
    exit;
}
if (($argv[1] ?? '') === 'assert') {
    if ((int) $db->query('SELECT COUNT(*) FROM tasks')->fetchColumn() !== 24) throw new RuntimeException('Persisted count mismatch.');
    $id = hash('sha256', 'synthetic-counter');
    $query = $db->prepare('SELECT hits FROM rate_limits WHERE id = ?'); $query->execute([$id]);
    if ((int) $query->fetchColumn() !== 6) throw new RuntimeException('Counter was not bounded.');
    $db->prepare('UPDATE schema_migrations SET sha256 = ?')->execute([str_repeat('0', 64)]);
    try { $migrations->up(); throw new LogicException('Changed migration accepted.'); }
    catch (RuntimeException $error) { if ($error->getMessage() !== 'Migration checksum mismatch.') throw $error; }
    echo "PASS persisted state and migration checksum rejection\n";
    exit;
}
$store = new App\Infrastructure\PdoTokenAuthenticator($db, static fn (): int => time());
foreach (['OWNER', 'OTHER', 'READER', 'EXPIRED', 'REVOKED'] as $kind) {
    $token = getenv('TEST_TOKEN_'.$kind);
    if (!is_string($token) || !preg_match('/\A[0-9a-f]{64}\z/D', $token)) throw new RuntimeException('Synthetic token required.');
    $now = time();
    $store->insert(hash('sha256', $token), $kind === 'OTHER' ? 'owner-b' : 'owner-a', $kind === 'READER' ? ['tasks:read'] : ['tasks:read', 'tasks:write'], $now - 100, $kind === 'EXPIRED' ? $now - 1 : $now + 3600);
    if ($kind === 'REVOKED') $store->revoke(hash('sha256', $token));
}
echo "PASS synthetic SQL fixture\n";
