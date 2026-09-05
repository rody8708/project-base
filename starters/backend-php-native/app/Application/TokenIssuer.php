<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Application;

/** Trusted operator use only. Never expose this service as a public issue-token route. */
final readonly class TokenIssuer
{
    public function __construct(private TokenStore $store, private \Closure $random, private \Closure $now) {}

    public function issue(string $subject, array $permissions, int $lifetime): array
    {
        if ($lifetime < 1 || $lifetime > 86400 || !array_is_list($permissions) || $permissions === []) throw new \InvalidArgumentException('Invalid token policy.');
        foreach ($permissions as $permission) if (!is_string($permission)) throw new \InvalidArgumentException('Invalid permission.');
        new Principal($subject, $permissions, '');
        $bytes = ($this->random)();
        if (!is_string($bytes) || strlen($bytes) !== 32) throw new \RuntimeException('Invalid entropy source.');
        $token = bin2hex($bytes);
        $id = hash('sha256', $token);
        $now = ($this->now)();
        if (!is_int($now) || $now < 0 || $now > PHP_INT_MAX - $lifetime) throw new \RuntimeException('Invalid clock.');
        $this->store->insert($id, $subject, array_values(array_unique($permissions)), $now, $now + $lifetime);
        return ['token' => $token, 'id' => $id, 'expires_at' => $now + $lifetime];
    }
}
