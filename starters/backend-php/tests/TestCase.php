<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as FrameworkTestCase;

abstract class TestCase extends FrameworkTestCase
{
    public function createApplication(): Application
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();
        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);
        $token = $this->issueToken('test-owner');
        $this->withToken($token);
        $this->app->make(\App\Application\IdentityContext::class)->set(
            $this->app->make(\App\Application\TokenAuthenticator::class)->authenticate($token));
    }

    protected function issueToken(string $subject, array $permissions = ['tasks:read', 'tasks:write'], int $ttl = 3600): string
    {
        $token = bin2hex(random_bytes(32));
        $this->app->make('db')->table('api_tokens')->insert(['id' => hash('sha256', $token), 'subject' => $subject,
            'permissions' => json_encode($permissions, JSON_THROW_ON_ERROR), 'expires_at' => time() + $ttl]);
        return $token;
    }

    protected function tearDown(): void
    {
        if ($this->app !== null) {
            $database = $this->app->make('db');
            foreach (array_keys($database->getConnections()) as $name) $database->purge($name);
        }
        parent::tearDown();
    }
}
