<?php
declare(strict_types=1);

namespace App\Application;

interface TokenAuthenticator
{
    public function authenticate(string $token): ?Principal;
    public function revoke(string $tokenId): void;
}
