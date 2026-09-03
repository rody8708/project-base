<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Feature;

use App\Providers\AppServiceProvider;
use RuntimeException;
use Tests\TestCase;

final class ConfigurationTest extends TestCase
{
    public function test_server_configuration_cannot_fall_back_to_an_implicit_host(): void
    {
        config(['database.default' => 'mysql', 'database.connections.mysql.host' => null]);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('explicit and complete');
        (new AppServiceProvider($this->app))->boot();
    }

    public function test_unreviewed_remote_mysql_profile_is_rejected_without_connecting(): void
    {
        config(['database.default' => 'mysql', 'database.connections.mysql' => [
            'host' => '203.0.113.10', 'port' => '13306', 'database' => 'synthetic',
            'username' => 'synthetic', 'password' => 'synthetic',
        ]]);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('loopback-only');
        (new AppServiceProvider($this->app))->boot();
    }
}
