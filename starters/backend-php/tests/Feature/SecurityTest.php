<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Feature;

use App\Application\IdentityContext;
use App\Application\TaskRepository;
use App\Application\AccessDenied;
use Tests\TestCase;

final class SecurityTest extends TestCase
{
    public function test_missing_malformed_expired_and_revoked_credentials_are_denied(): void
    {
        foreach (['', 'Basic abc', 'Bearer '.str_repeat('a', 64), 'Bearer '.$this->issueToken('expired', ['tasks:read'], -1)] as $header) {
            $this->withHeader('Authorization', $header)->getJson('/api/v1/tasks')->assertStatus(401)
                ->assertJsonPath('error.code', 'UNAUTHENTICATED')->assertHeader('WWW-Authenticate', 'Bearer');
        }
        $token = $this->issueToken('revoked');
        $this->withToken($token)->deleteJson('/api/v1/auth/token', ['confirm' => true])->assertNoContent();
        $this->getJson('/api/v1/tasks')->assertStatus(401);
        $this->getJson('/api/health')->assertOk();
    }

    public function test_query_tokens_are_not_credentials_and_errors_are_not_cached(): void
    {
        $this->withHeader('Authorization', '')->getJson('/api/v1/tasks?access_token='.$this->issueToken('query'))
            ->assertStatus(401)->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_reader_can_read_but_cannot_write_or_elevate_permissions(): void
    {
        $task = $this->postJson('/api/v1/tasks', ['title' => 'Owned'])->assertCreated()->json('data');
        $this->withToken($this->issueToken('test-owner', ['tasks:read']))->getJson('/api/v1/tasks')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/v1/tasks', ['title' => 'Denied'])->assertForbidden();
        $this->putJson('/api/v1/tasks/'.$task['id'], ['title' => 'Denied', 'completed' => true, 'version' => 1])->assertForbidden();
        $this->deleteJson('/api/v1/tasks/'.$task['id'], ['version' => 1])->assertForbidden();
        $this->getJson('/api/v1/auth/session')->assertJsonPath('data.permissions', ['tasks:read']);
        $this->assertDatabaseHas('tasks', ['id' => $task['id'], 'title' => 'Owned', 'version' => 1]);
    }

    public function test_other_identity_cannot_enumerate_read_modify_or_delete_objects(): void
    {
        $task = $this->postJson('/api/v1/tasks', ['title' => 'Private'])->assertCreated()->json('data');
        $this->withToken($this->issueToken('other'))->getJson('/api/v1/tasks')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/tasks/'.$task['id'])->assertNotFound();
        $this->putJson('/api/v1/tasks/'.$task['id'], ['title' => 'Attack', 'completed' => true, 'version' => 1])->assertNotFound();
        $this->deleteJson('/api/v1/tasks/'.$task['id'], ['version' => 1])->assertNotFound();
        $this->postJson('/api/v1/tasks', ['title' => 'Injected', 'owner_id' => 'test-owner'])->assertUnprocessable();
        $this->withHeader('X-Owner-Id', 'test-owner')->getJson('/api/v1/tasks')->assertJsonCount(0, 'data');
        $this->assertDatabaseCount('tasks', 1);
    }

    public function test_context_is_cleared_after_requests_and_direct_storage_denies_anonymous_access(): void
    {
        $this->getJson('/api/v1/tasks')->assertOk();
        $this->expectException(AccessDenied::class);
        $this->app->make(TaskRepository::class)->list(20, null);
    }

    public function test_no_permissions_denies_access_and_tokens_are_stored_hashed(): void
    {
        $token = $this->issueToken('empty', []);
        $this->withToken($token)->getJson('/api/v1/tasks')->assertForbidden();
        $this->assertDatabaseMissing('api_tokens', ['id' => $token]);
        $this->assertDatabaseHas('api_tokens', ['id' => hash('sha256', $token)]);
    }

    public function test_nonlocal_http_is_rejected_even_with_a_valid_token(): void
    {
        $this->app->instance('env', 'production');
        $this->getJson('/api/v1/tasks')->assertStatus(400);
    }

    public function test_rate_limit_is_persistent_and_returns_retry_after(): void
    {
        $limiter = $this->app->make(\Illuminate\Cache\RateLimiter::class);
        $key = 'api-ip:'.hash('sha256', '127.0.0.1');
        for ($i = 0; $i < 120; $i++) $limiter->hit($key, 60);
        $this->getJson('/api/v1/tasks')->assertStatus(429)->assertJsonPath('error.code', 'RATE_LIMITED')->assertHeader('Retry-After');
    }
}
