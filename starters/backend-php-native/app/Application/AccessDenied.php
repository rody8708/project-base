<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Application;

final class AccessDenied extends \RuntimeException
{
    public function __construct(public readonly bool $unauthenticated = false) { parent::__construct('Access denied.'); }
}
