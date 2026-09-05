<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Application;

/** Request-scoped authority; never populated from body, query, or an owner header. */
final class IdentityContext
{
    private ?Principal $principal = null;
    public function set(?Principal $principal): void { $this->principal = $principal; }
    public function principal(): Principal { return $this->principal ?? throw new AccessDenied(true); }
    public function require(string $permission): string
    {
        $principal = $this->principal();
        if (!in_array($permission, $principal->permissions, true)) throw new AccessDenied();
        return $principal->subject;
    }
}
