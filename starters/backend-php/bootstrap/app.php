<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

use App\Http\ApiBoundary;
use App\Http\ApiErrors;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', apiPrefix: 'api')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->remove([TrimStrings::class, ConvertEmptyStringsToNull::class]);
        $middleware->append(ApiBoundary::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontReport([\App\Application\AccessDenied::class]);
        $exceptions->shouldRenderJsonWhen(fn () => true);
        $exceptions->render(fn (Throwable $error) => ApiErrors::render($error));
    })->create();

// Laravel's default absolute cache prefixes do not include Windows drive paths.
// Keep explicitly isolated caches outside the starter on Windows as well as Unix.
if (PHP_OS_FAMILY === 'Windows') {
    foreach (array_merge(range('A', 'Z'), range('a', 'z')) as $drive) {
        $app->addAbsoluteCachePathPrefix($drive.':\\');
        $app->addAbsoluteCachePathPrefix($drive.':/');
    }
}
return $app;
