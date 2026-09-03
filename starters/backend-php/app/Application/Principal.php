<?php
declare(strict_types=1);

namespace App\Application;

final readonly class Principal
{
    public function __construct(public string $subject, public array $permissions, public string $tokenId)
    {
        if (!preg_match('/\A[a-z0-9][a-z0-9-]{0,63}\z/D', $subject)
            || array_diff($permissions, ['tasks:read', 'tasks:write'])) {
            throw new \InvalidArgumentException('Invalid principal.');
        }
    }
}
