<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Http;

use App\Domain\TaskConflict;
use App\Domain\TaskNotFound;
use App\Domain\TaskValidationFailed;
use App\Application\PersistenceUnavailable;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

final class ApiErrors
{
    public static function render(Throwable $error): JsonResponse
    {
        [$status, $code] = match (true) {
            $error instanceof \App\Application\AccessDenied => $error->unauthenticated ? [401, 'UNAUTHENTICATED'] : [403, 'FORBIDDEN'],
            $error instanceof TaskNotFound => [404, 'NOT_FOUND'],
            $error instanceof TaskConflict => [409, 'VERSION_CONFLICT'],
            $error instanceof ValidationException, $error instanceof TaskValidationFailed => [422, 'VALIDATION_FAILED'],
            $error instanceof PersistenceUnavailable => [503, 'PERSISTENCE_UNAVAILABLE'],
            $error instanceof HttpExceptionInterface => [$error->getStatusCode(), match ($error->getStatusCode()) {
                400 => 'BAD_REQUEST', 404 => 'NOT_FOUND', 405 => 'METHOD_NOT_ALLOWED',
                413 => 'PAYLOAD_TOO_LARGE', 415 => 'UNSUPPORTED_MEDIA_TYPE', 429 => 'RATE_LIMITED', default => 'HTTP_ERROR',
            }],
            default => [500, 'INTERNAL_ERROR'],
        };
        $body = ['error' => ['code' => $code, 'message' => __('api.'.$code)]];
        if ($error instanceof ValidationException) $body['error']['fields'] = array_keys($error->errors());
        return response()->json($body, $status, [
            ...($error instanceof HttpExceptionInterface ? $error->getHeaders() : []),
            ...($status === 401 ? ['WWW-Authenticate' => 'Bearer'] : []),
            'Cache-Control' => 'no-store',
            'Content-Language' => app()->getLocale(), 'X-Content-Type-Options' => 'nosniff',
            'Vary' => 'Accept-Language',
        ]);
    }
}
