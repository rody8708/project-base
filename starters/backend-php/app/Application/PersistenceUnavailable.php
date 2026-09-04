<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Application;

use RuntimeException;
use Throwable;

final class PersistenceUnavailable extends RuntimeException
{
    public function __construct(Throwable $previous)
    {
        parent::__construct('Persistence is unavailable.', 0, $previous);
    }
}
