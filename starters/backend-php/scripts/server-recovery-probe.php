<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';
require __DIR__.'/server-recovery-support.php';
try {
    $scope = getenv('FOUNDATION_RECOVERY_SCOPE') ?: '';
    $engine = getenv('DB_CONNECTION');
    if (getenv('DB_HOST') !== '127.0.0.1' || getenv('DB_DATABASE') !== ServerRecoverySupport::database($scope)
        || !in_array($engine, ['pgsql', 'mysql'], true) || getenv('APP_ENV') !== 'testing') {
        throw new RuntimeException('Disposable recovery scope required.');
    }
    $input = json_decode(stream_get_contents(STDIN) ?: '{}', true, 16, JSON_THROW_ON_ERROR);
    $app = require __DIR__.'/../bootstrap/app.php';
    $console = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $console->bootstrap();
    $db = $app->make('db');
    $db->connection()->getPdo();
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    $request = static function (string $token, string $method, string $path, array $body = []) use ($kernel): array {
        $request = \Illuminate\Http\Request::create('https://foundation.localhost'.$path, $method, [], [], [],
            ['HTTP_AUTHORIZATION' => 'Bearer '.$token, 'HTTP_ACCEPT' => 'application/json',
                'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '127.0.0.1'], json_encode((object) $body, JSON_THROW_ON_ERROR));
        $response = $kernel->handle($request);
        $kernel->terminate($request, $response);
        return [$response->getStatusCode(), $response->getContent() === '' ? null : json_decode($response->getContent(), true, 16, JSON_THROW_ON_ERROR)];
    };
    $expect = static function (bool $condition): void { if (!$condition) throw new RuntimeException('Recovery assertion failed.'); };
    $token = $input['token'] ?? '';
    $issue = static function (string $token, string $owner) use ($db): void {
        $db->table('api_tokens')->insert(['id' => hash('sha256', $token), 'subject' => $owner,
            'permissions' => '["tasks:read","tasks:write"]', 'expires_at' => time()+600]);
    };
    $tables = static function () use ($db, $engine): array {
        return $engine === 'pgsql'
            ? $db->select("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")
            : $db->select("SELECT TABLE_NAME AS table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE'");
    };
    $mode = $argv[1] ?? '';
    $result = match ($mode) {
        'ready' => ['ready' => true, 'version' => $db->selectOne('SELECT version() AS version')->version],
        'empty' => ['tables' => count($tables())],
        default => [],
    };
    if ($mode === 'seed') {
        ServerRecoverySupport::assertEmpty(count($tables()));
        $expect($console->call('migrate', ['--force' => true, '--no-interaction' => true]) === 0);
        $issue($token, 'recovery-owner');
        [$status, $body] = $request($token, 'POST', '/api/v1/tasks', ['title' => 'Recovery Café 🙂']);
        $expect($status === 201); $id = $body['data']['id'];
        $expect($request($token, 'PUT', '/api/v1/tasks/'.$id, ['title' => 'Recovery Café 🙂', 'completed' => true, 'version' => 1])[0] === 200);
        $other = bin2hex(random_bytes(32)); $issue($other, 'another-owner');
        $expect($request($other, 'POST', '/api/v1/tasks', ['title' => 'Other identity'])[0] === 201);
        $result = ['taskId' => $id];
    } elseif ($mode === 'fingerprint') {
        $content = [];
        foreach (['tasks', 'api_tokens', 'migrations'] as $table) {
            $content[$table] = $db->table($table)->orderBy('id')->get()->all();
        }
        if ($engine === 'mysql') {
            $expect(count($db->select("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE' AND ENGINE <> 'InnoDB'")) === 0);
            // This profile excludes stored routines/events and custom triggers, not silently omitting them.
            foreach (['routines' => 'ROUTINE_SCHEMA', 'events' => 'EVENT_SCHEMA', 'triggers' => 'TRIGGER_SCHEMA'] as $table => $column) {
                $expect((int) $db->selectOne("SELECT COUNT(*) AS count FROM information_schema.$table WHERE $column=DATABASE()")->count === 0);
            }
        }
        $result = ['logicalSha256' => hash('sha256', json_encode($content, JSON_THROW_ON_ERROR)), 'tables' => count($tables())];
    } elseif ($mode === 'mutate') {
        $expect($request($token, 'DELETE', '/api/v1/tasks/'.$input['taskId'], ['version' => 2])[0] === 204);
        [$status, $body] = $request($token, 'POST', '/api/v1/tasks', ['title' => 'After snapshot']);
        $expect($status === 201);
        $db->table('api_tokens')->where('id', hash('sha256', $token))->update(['revoked_at' => time()]);
        $result = ['laterId' => $body['data']['id']];
    } elseif ($mode === 'sanitize-and-probe') {
        $db->transaction(function () use ($db): void {
            $db->table('api_tokens')->update(['revoked_at' => time()]);
            $db->table('cache')->delete(); $db->table('cache_locks')->delete();
        });
        $expect($request($token, 'GET', '/api/v1/tasks')[0] === 401);
        $fresh = bin2hex(random_bytes(32)); $issue($fresh, 'recovery-owner');
        [$status, $body] = $request($fresh, 'GET', '/api/v1/tasks');
        $expect($status === 200 && count($body['data']) === 1 && $body['data'][0]['id'] === $input['taskId']
            && $body['data'][0]['version'] === 2 && $body['data'][0]['completed'] === true && $body['data'][0]['title'] === 'Recovery Café 🙂');
        $expect(!$db->table('tasks')->where('id', $input['laterId'])->exists());
        $db->table('api_tokens')->update(['revoked_at' => time()]);
        $result = ['result' => 'RESTORED_NOT_ACTIVATED', 'oldTokenStatus' => 401, 'freshTokenStatus' => 200,
            'ownerIsolation' => true, 'postSnapshotWriteAbsent' => true, 'transport' => 'in-process-http-kernel'];
    } elseif ($mode === 'source-unchanged') {
        $expect(!$db->table('tasks')->where('id', $input['taskId'])->exists());
        $expect($db->table('tasks')->where('id', $input['laterId'])->exists());
        $expect($request($token, 'GET', '/api/v1/tasks')[0] === 401);
        $result = ['sourceUnchanged' => true];
    } elseif (!in_array($mode, ['ready', 'empty'], true)) throw new RuntimeException('Unknown recovery probe.');
    echo json_encode($result, JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable) { fwrite(STDERR, "Recovery probe failed; private diagnostics suppressed.\n"); exit(1); }
