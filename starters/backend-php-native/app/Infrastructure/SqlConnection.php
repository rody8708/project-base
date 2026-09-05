<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use PDO;

final class SqlConnection
{
    public static function engine(): string
    {
        $engine = getenv('NATIVE_PHP_ENGINE') ?: 'sqlite';
        if (!in_array($engine, ['sqlite', 'pgsql', 'mysql'], true)) throw new \RuntimeException('Unsupported engine.');
        return $engine;
    }

    public static function open(): PDO
    {
        $engine = self::engine();
        if ($engine === 'sqlite') {
            $configured = getenv('NATIVE_PHP_DATABASE');
            $file = is_string($configured) ? realpath($configured) : false;
            if ($file === false || !is_file($file) || is_link($configured)) throw new \RuntimeException('Database unavailable.');
            return new PDO('sqlite:'.$file, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        }
        // This release supports local SQL servers only. Remote production TLS
        // requires a separately reviewed deployment profile, not a silent downgrade.
        $host = getenv('NATIVE_PHP_DB_HOST') ?: '127.0.0.1';
        $port = getenv('NATIVE_PHP_DB_PORT') ?: ($engine === 'pgsql' ? '5432' : '3306');
        $name = getenv('NATIVE_PHP_DB_NAME') ?: '';
        $user = getenv('NATIVE_PHP_DB_USER') ?: '';
        $password = getenv('NATIVE_PHP_DB_PASSWORD');
        if ($host !== '127.0.0.1' || !ctype_digit($port) || (int) $port < 1 || (int) $port > 65535
            || !preg_match('/\A[a-z][a-z0-9_]{0,62}\z/D', $name)
            || !preg_match('/\A[a-z][a-z0-9_]{0,62}\z/D', $user)
            || !is_string($password) || $password === '') throw new \RuntimeException('Explicit local SQL configuration required.');
        $dsn = $engine === 'pgsql' ? "pgsql:host=$host;port=$port;dbname=$name;sslmode=disable;connect_timeout=5"
            : "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
        return new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_TIMEOUT => 5]);
    }
}
