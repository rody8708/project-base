<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require __DIR__.'/check.php';

use App\Infrastructure\SqliteMigrations;
use App\Infrastructure\SqliteRateLimiter;
use App\Http\CorsPolicy;
use App\Http\HttpFailure;

$operations = new PDO('sqlite::memory:');
$migrations = new SqliteMigrations($operations);
$migrations->up();
$migrations->up();
check((int) $operations->query('SELECT COUNT(*) FROM schema_migrations')->fetchColumn() === 3, 'Idempotent migrations');
$now = 120;
$clock = static function () use (&$now): int { return $now; };
$limiter = new SqliteRateLimiter($operations, $clock, 2);
check($limiter->consume('synthetic-peer') === 0, 'First request');
check($limiter->consume('synthetic-peer') === 0, 'Second request');
check($limiter->consume('synthetic-peer') === 60, 'Limit enforced');
check($limiter->consume('synthetic-peer') === 60, 'Denied requests stay denied');
check($limiter->consume('other-peer') === 0, 'Independent peer');
check((int) $operations->query('SELECT MAX(hits) FROM rate_limits')->fetchColumn() === 3, 'Bounded counter');
$now = 179;
check($limiter->consume('synthetic-peer') === 1, 'Retry delay');
$now = 180;
check($limiter->consume('synthetic-peer') === 0, 'New window accepted');
check((int) $operations->query('SELECT COUNT(*) FROM rate_limits')->fetchColumn() === 1, 'Old peers pruned');
$cors = new CorsPolicy(['http://127.0.0.1:5180']);
check($cors->headers([]) === [], 'No origin needs no CORS');
rejects(HttpFailure::class, static fn () => $cors->headers(['origin' => 'null']));
rejects(HttpFailure::class, static fn () => $cors->headers(['origin' => 'http://127.0.0.1:5180.attacker.invalid']));
rejects(InvalidArgumentException::class, static fn () => new CorsPolicy(['*']));
rejects(HttpFailure::class, static fn () => $cors->preflight(['origin' => 'http://127.0.0.1:5180', 'access-control-request-method' => 'TRACE']));
rejects(HttpFailure::class, static fn () => $cors->preflight(['origin' => 'http://127.0.0.1:5180', 'access-control-request-method' => 'POST', 'access-control-request-headers' => 'Cookie']));
$operations->exec("UPDATE schema_migrations SET sha256 = 'tampered' WHERE name = '002_tokens.sql'");
rejects(RuntimeException::class, static fn () => $migrations->up());
check(!$operations->inTransaction(), 'Failed migration rolled back');
echo "PASS native PHP migration integrity, CORS and fixed-window limits\n";

$saved = new class implements App\Application\TokenStore {
    public array $records = [];
    public function insert(string $id, string $subject, array $permissions, int $createdAt, int $expiresAt): void
    {
        $this->records[] = compact('id', 'subject', 'permissions', 'createdAt', 'expiresAt');
    }
};
$issuer = new App\Application\TokenIssuer($saved, static fn (): string => str_repeat('a', 32), static fn (): int => 100);
$issued = $issuer->issue('synthetic-owner', ['tasks:read'], 3600);
check($issued['expires_at'] === 3700, 'Token expiry');
check($saved->records[0]['id'] === hash('sha256', $issued['token']), 'Only hash passed to persistence');
check(!in_array($issued['token'], $saved->records[0], true), 'Plaintext not persisted');
foreach ([0, 86401] as $invalidTtl) rejects(InvalidArgumentException::class, static fn () => $issuer->issue('synthetic-owner', ['tasks:read'], $invalidTtl));
rejects(InvalidArgumentException::class, static fn () => $issuer->issue('invalid owner', ['tasks:read'], 60));
rejects(InvalidArgumentException::class, static fn () => $issuer->issue('owner', ['admin'], 60));
check(count($saved->records) === 1, 'Invalid issuance never writes');
echo "PASS native PHP operator token issuance policy\n";

check(App\Http\RequestMetadata::language('es;q=0,en-US;q=1') === 'en-US', 'Zero quality ignored');
check(App\Http\RequestMetadata::language('en;q=0.5,es-419;q=0.9') === 'es-419', 'Highest quality selected');
check(App\Http\RequestMetadata::language('es;q=broken,en') === 'en-US', 'Invalid quality ignored');
rejects(App\Domain\TaskValidationFailed::class, static fn () => App\Http\RequestMetadata::query('limit=1&%6cimit=2'));
rejects(App\Http\HttpFailure::class, static fn () => App\Http\RequestMetadata::payload('{"title":"one","ti\\u0074le":"two"}'));
check(App\Http\RequestMetadata::payload('{"title":"a \\"quoted\\" value"}')['title'] === 'a "quoted" value', 'Escaped strings remain values');
echo "PASS native PHP request metadata and duplicate input boundaries\n";

$previousEngine = getenv('NATIVE_PHP_ENGINE');
$previousHost = getenv('NATIVE_PHP_DB_HOST');
try {
    putenv('NATIVE_PHP_ENGINE=unsupported');
    rejects(RuntimeException::class, static fn () => App\Infrastructure\SqlConnection::open());
    putenv('NATIVE_PHP_ENGINE=pgsql');
    putenv('NATIVE_PHP_DB_HOST=remote.invalid');
    rejects(RuntimeException::class, static fn () => App\Infrastructure\SqlConnection::open());
} finally {
    putenv($previousEngine === false ? 'NATIVE_PHP_ENGINE' : 'NATIVE_PHP_ENGINE='.$previousEngine);
    putenv($previousHost === false ? 'NATIVE_PHP_DB_HOST' : 'NATIVE_PHP_DB_HOST='.$previousHost);
}
echo "PASS native SQL configuration rejects unknown engines and remote hosts before connecting\n";
