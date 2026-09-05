<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Http;

final class RequestMetadata
{
    public static function language(string $value): string
    {
        $best = 'en-US';
        $quality = -1.0;
        foreach (explode(',', $value) as $entry) {
            if (!preg_match('/\A\s*(en-US|en|es-419|es)\s*(?:;\s*q=(0(?:\.[0-9]{0,3})?|1(?:\.0{0,3})?))?\s*\z/i', $entry, $match)) continue;
            $candidate = isset($match[2]) ? (float) $match[2] : 1.0;
            if ($candidate > 0 && $candidate > $quality) {
                $best = str_starts_with(strtolower($match[1]), 'es') ? 'es-419' : 'en-US';
                $quality = $candidate;
            }
        }
        return $best;
    }

    public static function requestId(string $supplied): string
    {
        if (preg_match('/\A[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/D', $supplied)) return $supplied;
        $hex = bin2hex(random_bytes(16));
        return substr($hex, 0, 8).'-'.substr($hex, 8, 4).'-4'.substr($hex, 13, 3).'-8'.substr($hex, 17, 3).'-'.substr($hex, 20);
    }

    public static function allow(string $path): string
    {
        return match (true) {
            $path === '/api/v1/tasks' => 'GET, POST, OPTIONS',
            $path === '/api/v1/auth/session' => 'GET, OPTIONS',
            $path === '/api/v1/auth/token' => 'DELETE, OPTIONS',
            preg_match('#\A/api/v1/tasks/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\z#D', $path) === 1 => 'GET, PUT, DELETE, OPTIONS',
            default => '',
        };
    }

    public static function query(string $raw): array
    {
        if ($raw === '') return [];
        $result = [];
        foreach (explode('&', $raw) as $pair) {
            [$key, $value] = array_pad(explode('=', $pair, 2), 2, '');
            $key = urldecode($key);
            if (!in_array($key, ['limit', 'after'], true) || array_key_exists($key, $result)) throw new \App\Domain\TaskValidationFailed('invalid_query');
            $result[$key] = urldecode($value);
        }
        return $result;
    }

    /** Only flat object payloads are accepted by the current task/session API. */
    public static function payload(string $body): array
    {
        try { $decoded = json_decode($body, false, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new HttpFailure(400, 'BAD_REQUEST'); }
        if (!$decoded instanceof \stdClass) throw new HttpFailure(400, 'BAD_REQUEST');
        foreach ((array) $decoded as $value) {
            if (is_array($value) || is_object($value)) throw new \App\Domain\TaskValidationFailed('invalid_fields');
        }
        // Scan complete JSON strings, so quoted text within a value cannot become a key.
        preg_match_all('/"(?:[^"\\\\]|\\\\.)*"/s', $body, $strings, PREG_OFFSET_CAPTURE);
        $seen = [];
        foreach ($strings[0] as [$string, $offset]) {
            if (!str_starts_with(ltrim(substr($body, $offset + strlen($string))), ':')) continue;
            $key = json_decode($string, true, 32, JSON_THROW_ON_ERROR);
            if (array_key_exists($key, $seen)) throw new HttpFailure(400, 'BAD_REQUEST');
            $seen[$key] = true;
        }
        return (array) $decoded;
    }
}
