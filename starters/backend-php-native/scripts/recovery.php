<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';
require __DIR__.'/path-policy.php';

try {
    if (PHP_SAPI !== 'cli' || !in_array($argv[1] ?? '', ['snapshot', 'verify', 'restore'], true)
        || count($argv) !== ($argv[1] === 'verify' ? 3 : 4)) throw new RuntimeException('Invalid arguments.');
    // No operation may address repository contents. Existing parents are resolved
    // before calling the adapter; source/destination must be explicit absolute paths.
    $repository = protectedBoundary();
    foreach (array_slice($argv, 2) as $target) {
        if (!preg_match('#\A(?:[A-Za-z]:[\\\\/]|/)#', $target) || str_contains($target, "\0")) throw new RuntimeException('Absolute path required.');
        $parent = realpath(dirname($target));
        if ($parent === false || is_link($target)) throw new RuntimeException('Plain external path required.');
        $resolved = realpath($target) ?: $parent.DIRECTORY_SEPARATOR.basename($target);
        $normalized = strtolower(str_replace('\\', '/', $resolved));
        if ($normalized === $repository || str_starts_with($normalized, $repository.'/')) throw new RuntimeException('External path required.');
    }
    $recovery = new App\Infrastructure\SqliteRecovery();
    $result = match ($argv[1]) {
        'snapshot' => $recovery->snapshot($argv[2], $argv[3]),
        'verify' => $recovery->verify($argv[2]),
        'restore' => $recovery->restore($argv[2], $argv[3]),
    };
    echo json_encode($result, JSON_THROW_ON_ERROR)."\n";
} catch (Throwable) {
    fwrite(STDERR, "Recovery failed. Verify explicit external paths, integrity and new destinations. Any partial output is retained for inspection; never activate it.\n");
    exit(1);
}
