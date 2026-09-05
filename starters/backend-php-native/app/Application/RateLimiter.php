<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Application;

interface RateLimiter
{
    /** Return zero when accepted, otherwise the seconds until a retry is allowed. */
    public function consume(string $key): int;
}
