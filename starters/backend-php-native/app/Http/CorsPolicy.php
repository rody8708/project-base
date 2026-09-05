<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Http;

final readonly class CorsPolicy
{
    public function __construct(private array $origins = [])
    {
        foreach ($origins as $origin) {
            if (!is_string($origin) || !preg_match('#\Ahttps?://[a-zA-Z0-9.-]+(?::[0-9]{1,5})?\z#D', $origin)) throw new \InvalidArgumentException('Exact HTTP origins required.');
        }
    }

    public function headers(array $request): array
    {
        if (!isset($request['origin'])) return [];
        if (!in_array($request['origin'], $this->origins, true)) throw new HttpFailure(403, 'FORBIDDEN');
        return ['Access-Control-Allow-Origin' => $request['origin'],
            'Access-Control-Expose-Headers' => 'X-Request-Id, Content-Language, Location, Retry-After'];
    }

    public function preflight(array $request): array
    {
        if (!isset($request['origin']) || !in_array($request['access-control-request-method'] ?? '', ['GET', 'POST', 'PUT', 'DELETE'], true)) throw new HttpFailure(403, 'FORBIDDEN');
        foreach (explode(',', strtolower($request['access-control-request-headers'] ?? '')) as $header) {
            if (!in_array(trim($header), ['', 'authorization', 'content-type', 'accept-language', 'x-request-id'], true)) throw new HttpFailure(403, 'FORBIDDEN');
        }
        return [...$this->headers($request), 'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type, Accept-Language, X-Request-Id'];
    }
}
