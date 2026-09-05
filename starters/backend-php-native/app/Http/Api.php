<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Http;

use App\Application\AccessDenied;
use App\Application\IdentityContext;
use App\Application\PersistenceUnavailable;
use App\Application\TaskService;
use App\Application\TokenAuthenticator;
use App\Application\RateLimiter;
use App\Domain\TaskConflict;
use App\Domain\TaskNotFound;
use App\Domain\TaskValidationFailed;

final readonly class Api
{
    public function __construct(private TaskService $tasks, private TokenAuthenticator $tokens, private IdentityContext $identity,
        private RateLimiter $limiter, private CorsPolicy $cors) {}

    /** Local evaluation boundary. Headers must have lowercase names. No cookies or sessions are consumed. */
    public function handle(string $method, string $target, array $headers, string $body, string $peer): array
    {
        $this->identity->set(null);
        $requestId = RequestMetadata::requestId($headers['x-request-id'] ?? '');
        $language = RequestMetadata::language($headers['accept-language'] ?? '');
        $responseHeaders = ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff', 'X-Request-Id' => $requestId, 'Content-Language' => $language, 'Vary' => 'Accept-Language, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'];
        try {
            $responseHeaders = [...$responseHeaders, ...$this->cors->headers($headers)];
            if (strlen($target) > 2048) throw new HttpFailure(400, 'BAD_REQUEST');
            $path = explode('?', $target, 2)[0];
            if ($method === 'GET' && $target === '/api/health') return [200, ['status' => 'ok', 'scope' => 'liveness'], $responseHeaders];
            $retry = $this->limiter->consume($peer);
            if ($retry > 0) {
                $responseHeaders['Retry-After'] = (string) $retry;
                throw new HttpFailure(429, 'RATE_LIMITED');
            }
            if ($method === 'OPTIONS') return [204, null, [...$responseHeaders, ...$this->cors->preflight($headers)]];
            $authorization = $headers['authorization'] ?? '';
            if (!preg_match('/\ABearer ([0-9a-f]{64})\z/D', $authorization, $match)) throw new AccessDenied(true);
            $principal = $this->tokens->authenticate($match[1]);
            if ($principal === null) throw new AccessDenied(true);
            $this->identity->set($principal);
            $payload = [];
            if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
                if (strlen($body) > 8192) throw new HttpFailure(413, 'PAYLOAD_TOO_LARGE');
                if (!preg_match('/\Aapplication\/json(?:\s*;\s*charset=utf-8)?\z/i', $headers['content-type'] ?? '')) throw new HttpFailure(415, 'UNSUPPORTED_MEDIA_TYPE');
                $payload = RequestMetadata::payload($body);
            }
            [$status, $data, $extra] = $this->dispatch($method, $path, $target, $payload);
            return [$status, $data, [...$responseHeaders, ...$extra]];
        } catch (\Throwable $error) {
            [$status, $code] = match (true) {
                $error instanceof AccessDenied => $error->unauthenticated ? [401, 'UNAUTHENTICATED'] : [403, 'FORBIDDEN'],
                $error instanceof TaskNotFound => [404, 'NOT_FOUND'],
                $error instanceof TaskConflict => [409, 'VERSION_CONFLICT'],
                $error instanceof TaskValidationFailed => [422, 'VALIDATION_FAILED'],
                $error instanceof PersistenceUnavailable => [503, 'PERSISTENCE_UNAVAILABLE'],
                $error instanceof HttpFailure => [$error->status, $error->errorCode],
                default => [500, 'INTERNAL_ERROR'],
            };
            if ($status >= 500) error_log(json_encode(['event' => 'api.request.failed', 'request_id' => $requestId, 'status' => $status], JSON_THROW_ON_ERROR));
            if ($status === 401) $responseHeaders['WWW-Authenticate'] = 'Bearer';
            if ($status === 405) $responseHeaders['Allow'] = RequestMetadata::allow(explode('?', $target, 2)[0]);
            $messages = require dirname(__DIR__, 2).'/lang/'.$language.'.php';
            return [$status, ['error' => ['code' => $code, 'message' => $messages['request_failed']]], $responseHeaders];
        } finally { $this->identity->set(null); }
    }

    private function fields(array $payload, array $expected): void
    {
        if (array_diff(array_keys($payload), $expected) || array_diff($expected, array_keys($payload))) throw new TaskValidationFailed('invalid_fields');
        if (array_key_exists('completed', $payload) && !is_bool($payload['completed'])) throw new TaskValidationFailed('invalid_completed');
        if (array_key_exists('version', $payload) && (!is_int($payload['version']) || $payload['version'] < 1 || $payload['version'] > 2147483646)) throw new TaskValidationFailed('invalid_version');
        if (array_key_exists('title', $payload) && !is_string($payload['title'])) throw new TaskValidationFailed('invalid_title');
    }

    private function dispatch(string $method, string $path, string $target, array $payload): array
    {
        if ($path === '/api/v1/auth/session' && $method === 'GET') {
            $principal = $this->identity->principal();
            return [200, ['data' => ['subject' => $principal->subject, 'permissions' => $principal->permissions]], []];
        }
        if ($path === '/api/v1/auth/token' && $method === 'DELETE') {
            $this->fields($payload, []);
            $this->tokens->revoke($this->identity->principal()->tokenId);
            return [204, null, []];
        }
        if ($path === '/api/v1/tasks') return $this->collection($method, $target, $payload);
        if (preg_match('#\A/api/v1/tasks/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\z#D', $path, $match)) {
            return $this->item($method, $match[1], $payload);
        }
        if (in_array($path, ['/api/v1/auth/session', '/api/v1/auth/token'], true)) throw new HttpFailure(405, 'METHOD_NOT_ALLOWED');
        throw new HttpFailure(404, 'NOT_FOUND');
    }

    private function collection(string $method, string $target, array $payload): array
    {
        if ($method === 'GET') {
            $query = RequestMetadata::query(explode('?', $target, 2)[1] ?? '');
            if (array_diff(array_keys($query), ['limit', 'after'])) throw new TaskValidationFailed('invalid_query');
            if (isset($query['limit']) && (!is_string($query['limit']) || !preg_match('/\A(?:[1-9][0-9]?|100)\z/D', $query['limit']))) throw new TaskValidationFailed('invalid_limit');
            if (isset($query['after']) && !is_string($query['after'])) throw new TaskValidationFailed('invalid_after');
            $items = $this->tasks->list((int) ($query['limit'] ?? 20), $query['after'] ?? null);
            return [200, ['data' => array_map(static fn ($task) => $task->toArray(), $items), 'next_after' => $items === [] ? null : $items[array_key_last($items)]->id], []];
        }
        if ($method === 'POST') {
            $this->fields($payload, ['title']);
            $task = $this->tasks->create($payload['title']);
            return [201, ['data' => $task->toArray()], ['Location' => '/api/v1/tasks/'.$task->id]];
        }
        throw new HttpFailure(405, 'METHOD_NOT_ALLOWED');
    }

    private function item(string $method, string $id, array $payload): array
    {
        if ($method === 'GET') return [200, ['data' => $this->tasks->get($id)->toArray()], []];
        if ($method === 'PUT') {
            $this->fields($payload, ['title', 'completed', 'version']);
            if ($payload['version'] > 2147483645) throw new TaskValidationFailed('invalid_version');
            return [200, ['data' => $this->tasks->replace($id, $payload['title'], $payload['completed'], $payload['version'])->toArray()], []];
        }
        if ($method === 'DELETE') {
            $this->fields($payload, ['version']);
            $this->tasks->delete($id, $payload['version']);
            return [204, null, []];
        }
        throw new HttpFailure(405, 'METHOD_NOT_ALLOWED');
    }
}
