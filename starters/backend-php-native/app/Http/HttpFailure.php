<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Http;

final class HttpFailure extends \RuntimeException
{
    public function __construct(public readonly int $status, public readonly string $errorCode) { parent::__construct($errorCode); }
}
