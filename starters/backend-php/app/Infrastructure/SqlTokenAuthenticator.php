<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Infrastructure;

use App\Application\Principal;
use App\Application\TokenAuthenticator;
use Illuminate\Database\DatabaseManager;

final readonly class SqlTokenAuthenticator implements TokenAuthenticator
{
    public function __construct(private DatabaseManager $database) {}
    public function authenticate(string $token): ?Principal
    {
        if (!preg_match('/\A[0-9a-f]{64}\z/D', $token)) return null;
        $hash = hash('sha256', $token);
        $row = $this->database->table('api_tokens')->where('id', $hash)->whereNull('revoked_at')
            ->where('expires_at', '>', time())->first();
        if ($row === null) return null;
        try {
            $permissions = json_decode($row->permissions, true, 8, JSON_THROW_ON_ERROR);
            if (!is_array($permissions) || !array_is_list($permissions)) return null;
            return new Principal($row->subject, $permissions, $hash);
        } catch (\JsonException | \InvalidArgumentException) { return null; }
    }
    public function revoke(string $tokenId): void
    {
        $this->database->table('api_tokens')->where('id', $tokenId)->update(['revoked_at' => time()]);
    }
}
