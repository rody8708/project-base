<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Application;

/** Pure configuration checks, not a certification or deployment approval. */
final class ProductionPolicy
{
    public static function failures(array $settings): array
    {
        $failures = [];
        if (($settings['environment'] ?? null) !== 'production') $failures[] = 'ENVIRONMENT_NOT_PRODUCTION';
        if (($settings['debug'] ?? true) !== false) $failures[] = 'DEBUG_ENABLED';
        $key = $settings['key'] ?? '';
        if (!is_string($key) || !str_starts_with($key, 'base64:') || strlen(base64_decode(substr($key, 7), true) ?: '') !== 32) $failures[] = 'INVALID_APP_KEY';
        $url = parse_url($settings['url'] ?? '');
        if (!is_array($url) || ($url['scheme'] ?? '') !== 'https' || empty($url['host'])
            || isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment'])
            || in_array($url['host'], ['localhost', '127.0.0.1', '::1', '[::1]'], true)) $failures[] = 'INVALID_HTTPS_URL';
        if (($settings['cache'] ?? '') !== 'database') $failures[] = 'NONPERSISTENT_RATE_LIMIT';
        foreach ($settings['origins'] ?? [] as $origin) {
            $parts = parse_url($origin);
            if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host'])
                || str_contains($origin, '*') || isset($parts['user']) || isset($parts['pass'])
                || isset($parts['query']) || isset($parts['fragment']) || isset($parts['path'])
                || in_array($parts['host'], ['localhost', '127.0.0.1', '[::1]'], true)) {
                $failures[] = 'INVALID_CORS_ORIGIN'; break;
            }
        }
        return $failures;
    }
}
