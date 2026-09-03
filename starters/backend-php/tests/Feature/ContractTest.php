<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class ContractTest extends TestCase
{
    public function test_wire_shape_and_title_limit_match_the_neutral_contract(): void
    {
        $spec = json_decode(file_get_contents(__DIR__.'/../../contracts/task-api-v1.openapi.json'), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('3.1.0', $spec['openapi']);
        $schema = $spec['components']['schemas']['Task'];
        $limit = $schema['properties']['title']['maxLength'];
        $created = $this->postJson('/api/v1/tasks', ['title' => str_repeat('🙂', $limit)])->assertCreated();
        $task = $created->json('data');
        self::assertSame($schema['required'], array_keys($task));
        self::assertIsBool($task['completed']);
        self::assertIsInt($task['version']);
        self::assertMatchesRegularExpression('/'.$schema['properties']['id']['pattern'].'/D', $task['id']);
        $this->postJson('/api/v1/tasks', ['title' => str_repeat('🙂', $limit + 1)])->assertStatus(422);
    }

    public function test_cors_accepts_only_configured_origins(): void
    {
        config(['cors.allowed_origins' => ['http://127.0.0.1:5180']]);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5180', 'Access-Control-Request-Method' => 'POST'])
            ->options('/api/v1/tasks')->assertHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5180');
        $this->withHeaders(['Origin' => 'https://untrusted.example', 'Access-Control-Request-Method' => 'POST'])
            ->options('/api/v1/tasks')->assertHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5180');
    }
}
