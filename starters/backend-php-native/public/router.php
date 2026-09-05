<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

// Development only. Never delegates to the built-in static-file server.
ini_set('display_errors', '0');
require dirname(__DIR__).'/bootstrap.php';

use App\Application\IdentityContext;
use App\Application\TaskService;
use App\Http\Api;
use App\Http\CorsPolicy;
use App\Infrastructure\SqliteRateLimiter;
use App\Infrastructure\SqlConnection;
use App\Infrastructure\PdoTaskRepository;
use App\Infrastructure\PdoTokenAuthenticator;
use App\Infrastructure\ServerRateLimiter;

try {
    if (PHP_SAPI !== 'cli-server' || !in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
        || !preg_match('/\A127\.0\.0\.1:[0-9]{1,5}\z/D', $_SERVER['HTTP_HOST'] ?? '')) {
        http_response_code(403);
        exit;
    }
    $database = SqlConnection::open();
    $identity = new IdentityContext();
    $newId = static function (): string {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 15) | 64);
        $bytes[8] = chr((ord($bytes[8]) & 63) | 128);
        $hex = bin2hex($bytes);
        return substr($hex, 0, 8).'-'.substr($hex, 8, 4).'-'.substr($hex, 12, 4).'-'.substr($hex, 16, 4).'-'.substr($hex, 20);
    };
    $api = new Api(new TaskService(new PdoTaskRepository($database, $identity), $newId),
        new PdoTokenAuthenticator($database, static fn (): int => time()), $identity,
        SqlConnection::engine() === 'sqlite' ? new SqliteRateLimiter($database, static fn (): int => time()) : new ServerRateLimiter($database, static fn (): int => time()),
        new CorsPolicy(array_values(array_filter(array_map('trim', explode(',', getenv('API_ALLOWED_ORIGINS') ?: ''))))));
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    // Read at most one byte above the accepted size; never load an unbounded body.
    $body = file_get_contents('php://input', false, null, 0, 8193);
    [$status, $payload, $responseHeaders] = $api->handle($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'], $headers, $body === false ? '' : $body, $_SERVER['REMOTE_ADDR']);
    http_response_code($status);
    foreach ($responseHeaders as $name => $value) header($name.': '.$value);
    if ($status !== 204) echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
} catch (Throwable) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(['error' => ['code' => 'PERSISTENCE_UNAVAILABLE', 'message' => 'The service is unavailable.']]);
}
