<?php
declare(strict_types=1);

namespace App\Infrastructure;

/** Read the effective runtime settings, including a loaded configuration cache. */
final class ProductionSettings
{
    public static function current(): array
    {
        return ['environment' => config('app.env'), 'debug' => config('app.debug'),
            'key' => config('app.key'), 'url' => config('app.url'), 'cache' => config('cache.default'),
            'origins' => config('cors.allowed_origins', [])];
    }
}
