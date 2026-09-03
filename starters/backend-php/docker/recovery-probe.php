<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

// Runs only in a newly created disposable lab, against a separate restored DB.
require '/app/vendor/autoload.php';
if (getenv('DB_DATABASE') !== '/state/database.sqlite' || !is_file('/state/recovered.sqlite')) exit(1);
$input = json_decode(stream_get_contents(STDIN), true, 8, JSON_THROW_ON_ERROR);
foreach (['APP_CONFIG_CACHE' => '/state/recovery-unused-config.php', 'APP_ROUTES_CACHE' => '/state/recovery-unused-routes.php',
    'DB_DATABASE' => '/state/recovered.sqlite', 'APP_KEY' => trim(file_get_contents('/state/app-key'))] as $key => $value) {
    putenv($key.'='.$value); $_ENV[$key] = $value; $_SERVER[$key] = $value;
}
$app = require '/app/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$db = $app->make('db');
$activeTokens = $db->table('api_tokens')->whereNull('revoked_at')->count();
if ($activeTokens !== 0) throw new RuntimeException('Restore retained active credentials.');
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$request = static function (string $token, string $path) use ($kernel): array {
    $request = \Illuminate\Http\Request::create('https://foundation.localhost'.$path, 'GET', [], [], [],
        ['HTTP_AUTHORIZATION' => 'Bearer '.$token, 'HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '127.0.0.1']);
    $response = $kernel->handle($request);
    $kernel->terminate($request, $response);
    return [$response->getStatusCode(), json_decode($response->getContent(), true, 16, JSON_THROW_ON_ERROR)];
};
if ($request($input['oldToken'], '/api/v1/tasks')[0] !== 401) throw new RuntimeException('Old token was accepted.');
$freshToken = bin2hex(random_bytes(32));
$db->table('api_tokens')->insert(['id' => hash('sha256', $freshToken), 'subject' => 'lab-owner',
    'permissions' => '["tasks:read"]', 'expires_at' => time()+300]);
[$status, $body] = $request($freshToken, '/api/v1/tasks');
if ($status !== 200 || count($body['data']) !== 1 || $body['data'][0]['id'] !== $input['taskId']
    || $body['data'][0]['version'] !== 2 || $body['data'][0]['completed'] !== true) throw new RuntimeException('Restored API data mismatch.');
$db->table('api_tokens')->update(['revoked_at' => time()]);
echo json_encode(['result' => 'PASS', 'restoredTaskCount' => 1, 'oldTokenStatus' => 401,
    'freshTokenStatus' => 200, 'transport' => 'in-process-http-kernel', 'liveDatabaseSwitched' => false], JSON_THROW_ON_ERROR).PHP_EOL;
