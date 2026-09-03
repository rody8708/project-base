<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';
umask(0077);
try {
    $adapter = new \App\Infrastructure\SqliteRecovery();
    $result = match (true) {
        $argc === 4 && $argv[1] === 'snapshot' => $adapter->snapshot($argv[2], $argv[3]),
        $argc === 3 && $argv[1] === 'verify' => $adapter->verify($argv[2]),
        $argc === 4 && $argv[1] === 'restore' => $adapter->restore($argv[2], $argv[3]),
        default => throw new RuntimeException('Usage: snapshot SOURCE NEW_DIRECTORY | verify DIRECTORY | restore DIRECTORY NEW_DATABASE'),
    };
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable) {
    fwrite(STDERR, "RECOVERY_FAILED: check paths, permissions, snapshot integrity and schema. Existing data was not replaced; quarantine any partial new output.\n");
    exit(1);
}
