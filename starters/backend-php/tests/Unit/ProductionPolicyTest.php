<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Unit;

use App\Application\ProductionPolicy;
use PHPUnit\Framework\TestCase;

final class ProductionPolicyTest extends TestCase
{
    private function valid(): array
    {
        return ['environment' => 'production', 'debug' => false, 'key' => 'base64:'.base64_encode(random_bytes(32)),
            'url' => 'https://api.example.test', 'cache' => 'database', 'origins' => ['https://app.example.test']];
    }
    public function test_valid_configuration_only_passes_local_policy(): void
    {
        self::assertSame([], ProductionPolicy::failures($this->valid()));
    }
    public function test_unsafe_configuration_fails_closed(): void
    {
        foreach (['environment' => 'local', 'debug' => true, 'key' => '', 'url' => 'http://api.example.test', 'cache' => 'array',
            'origins' => ['*']] as $key => $value) {
            self::assertNotEmpty(ProductionPolicy::failures([...$this->valid(), $key => $value]), $key);
        }
        foreach (['https://user:pass@api.example.test', 'https://localhost', 'https://api.example.test?token=secret'] as $url) {
            self::assertContains('INVALID_HTTPS_URL', ProductionPolicy::failures([...$this->valid(), 'url' => $url]));
        }
        foreach (['http://app.example.test', 'https://app.example.test/path', 'https://*.example.test', 'https://localhost'] as $origin) {
            self::assertContains('INVALID_CORS_ORIGIN', ProductionPolicy::failures([...$this->valid(), 'origins' => [$origin]]));
        }
    }
}
