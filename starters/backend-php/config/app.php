<?php
declare(strict_types=1);

return [
    'name' => env('APP_NAME', 'Foundation API example'),
    'env' => env('APP_ENV', 'local'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://127.0.0.1:8080'),
    'timezone' => 'UTC',
    'locale' => env('APP_LOCALE', 'en-US'),
    'fallback_locale' => 'en-US',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
];
