<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    if (!str_starts_with($class, 'App\\') || !preg_match('/\A[A-Za-z0-9_\\\\]+\z/D', $class)) return;
    $file = __DIR__.'/app/'.str_replace('\\', '/', substr($class, 4)).'.php';
    if (is_file($file)) require $file;
});
