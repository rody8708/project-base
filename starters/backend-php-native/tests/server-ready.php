<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';
try {
    App\Infrastructure\SqlConnection::open();
    echo "ready\n";
} catch (Throwable $error) {
    // Classification only, never DSNs, credentials or driver error messages.
    echo json_encode(['class' => get_class($error), 'code' => $error->getCode()])."\n";
    exit(1);
}
