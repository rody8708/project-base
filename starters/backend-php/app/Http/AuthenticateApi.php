<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Http;

use App\Application\AccessDenied;
use App\Application\IdentityContext;
use App\Application\TokenAuthenticator;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

final readonly class AuthenticateApi
{
    public function __construct(private TokenAuthenticator $tokens, private IdentityContext $identity) {}
    public function handle(Request $request, Closure $next): mixed
    {
        $this->identity->set(null);
        try {
            if (!app()->environment(['local', 'testing']) && !$request->isSecure()) throw new HttpException(400);
            $limiter = app(\Illuminate\Cache\RateLimiter::class);
            $key = 'api-ip:'.hash('sha256', $request->ip() ?? 'unknown');
            if ($limiter->tooManyAttempts($key, 120)) {
                throw new HttpException(429, '', null, ['Retry-After' => (string) $limiter->availableIn($key)]);
            }
            $limiter->hit($key, 60);
            $authorization = $request->header('Authorization', '');
            if (!preg_match('/\ABearer ([0-9a-f]{64})\z/Di', $authorization, $match)) throw new AccessDenied(true);
            $principal = $this->tokens->authenticate($match[1]);
            if ($principal === null) throw new AccessDenied(true);
            $this->identity->set($principal);
            return $next($request);
        } finally { $this->identity->set(null); }
    }
}
