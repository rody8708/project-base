<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';
require __DIR__.'/path-policy.php';

try {
    if (PHP_SAPI === 'cli' && count($argv) === 2 && $argv[1] === 'server-up') {
        (new App\Infrastructure\ServerMigrations(App\Infrastructure\SqlConnection::open()))->up();
        echo "PASS server migrations\n";
        exit;
    }
    if (PHP_SAPI !== 'cli' || count($argv) !== 3 || !in_array($argv[1], ['init', 'up'], true)) throw new RuntimeException('Invalid arguments.');
    $requested = $argv[2];
    if (!preg_match('#\A(?:[A-Za-z]:[\\\\/]|/)#', $requested) || str_contains($requested, "\0")) throw new RuntimeException('Absolute path required.');
    $parent = realpath(dirname($requested));
    if ($parent === false) throw new RuntimeException('Existing parent required.');
    $normalized = strtolower(str_replace('\\', '/', $parent));
    $boundary = protectedBoundary();
    if ($normalized === $boundary || str_starts_with($normalized, $boundary.'/')) throw new RuntimeException('External database required.');
    $file = $parent.DIRECTORY_SEPARATOR.basename($requested);
    if (!preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9_-]*\.sqlite\z/D', basename($requested))) throw new RuntimeException('Safe SQLite filename required.');
    if ($argv[1] === 'init') {
        $handle = @fopen($file, 'x');
        if ($handle === false) throw new RuntimeException('New database required.');
        fclose($handle);
        if (PHP_OS_FAMILY !== 'Windows' && !chmod($file, 0600)) throw new RuntimeException('Private permissions required.');
    }
    if (!is_file($file) || is_link($file) || (stat($file)['nlink'] ?? 0) !== 1) throw new RuntimeException('Plain database required.');
    (new App\Infrastructure\SqliteMigrations(new PDO('sqlite:'.$file)))->up();
    echo "PASS SQLite migrations\n";
} catch (Throwable) {
    // Never disclose filesystem paths or database details. A failed init keeps its file for inspection.
    fwrite(STDERR, "Database preparation failed; verify arguments, external destination and migration integrity. Existing files are never replaced.\n");
    exit(1);
}
