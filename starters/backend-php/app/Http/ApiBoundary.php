<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Http;

use Closure;
use Illuminate\Http\Request;
use JsonException;
use Symfony\Component\HttpFoundation\AcceptHeader;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class ApiBoundary
{
    public function handle(Request $request, Closure $next): mixed
    {
        $locale = 'en-US';
        $supported = ['en-us' => 'en-US', 'en' => 'en-US', 'es-419' => 'es-419', 'es' => 'es-419'];
        foreach (AcceptHeader::fromString($request->headers->get('Accept-Language', ''))->all() as $language) {
            if ($language->getQuality() > 0 && isset($supported[strtolower($language->getValue())])) {
                $locale = $supported[strtolower($language->getValue())];
                break;
            }
        }
        app()->setLocale($locale);
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            if (strlen($request->getContent()) > 8192) throw new HttpException(413);
            if (!$request->isJson()) throw new HttpException(415);
            try {
                $body = json_decode($request->getContent(), false, 32, JSON_THROW_ON_ERROR);
                if (!is_object($body)) throw new HttpException(400);
            } catch (JsonException) {
                throw new HttpException(400);
            }
        }
        $response = $next($request);
        $response->headers->set('Content-Language', $locale);
        $response->headers->set('Cache-Control', 'no-store');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Vary', 'Accept-Language');
        return $response;
    }
}
