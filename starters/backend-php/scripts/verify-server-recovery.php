<?php
declare(strict_types=1);

use Symfony\Component\Process\Process;

require __DIR__.'/../vendor/autoload.php';
require __DIR__.'/server-recovery-support.php';
if ($argc !== 2 || $argv[1] !== '--wsl-docker' || PHP_OS_FAMILY !== 'Windows') {
    fwrite(STDERR, "Usage: php -d extension=pdo_pgsql scripts/verify-server-recovery.php --wsl-docker\n"); exit(1);
}
umask(0077);
$base = dirname(__DIR__);
$scope = bin2hex(random_bytes(8));
$database = ServerRecoverySupport::database($scope);
$parent = $base.'/.validation';
if (!is_dir($parent)) mkdir($parent, 0700);
if (is_link($parent)) throw new RuntimeException('Linked report directory rejected.');
$working = $parent.'/recovery-'.$scope;
if (!mkdir($working, 0700)) throw new RuntimeException('Cannot reserve report directory.');
$docker = ['wsl.exe', '-d', 'Ubuntu-24.04', '--', 'docker'];
$run = static function (array $args, ?string $input = null, array $env = [], int $timeout = 180) use ($base): string {
    $process = new Process($args, $base, $env, $input, $timeout);
    $process->run();
    if (!$process->isSuccessful()) throw new RuntimeException('Isolated child operation failed; private output suppressed.');
    return $process->getOutput(); // Binary dumps must NOT be trimmed or converted by a shell.
};
$active = [];
$report = ['kind' => 'isolated-native-server-recovery', 'scope' => $scope, 'startedAt' => gmdate('c'),
    'success' => false, 'productionApproved' => false, 'engines' => [], 'containersRemoved' => []];
$cleanup = static function (string $name) use (&$active, &$report, $run, $docker, $scope): void {
    $owned = $active[$name];
    $item = json_decode($run([...$docker, 'inspect', $name]), true, 64, JSON_THROW_ON_ERROR)[0];
    ServerRecoverySupport::assertOwned($item, $scope, $owned['engine'], $owned['role']);
    if ($item['Id'] !== $owned['id']) throw new RuntimeException('Container identity changed; cleanup refused.');
    $run([...$docker, 'rm', '--force', '--volumes', $owned['id']]);
    unset($active[$name]); $report['containersRemoved'][] = $name;
};
$specs = [
    'pgsql' => ['image' => 'postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af', 'port' => 5432],
    'mysql' => ['image' => 'mysql:8.4.11@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb', 'port' => 3306],
];
try {
    if (trim($run([...$docker, 'context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'])) !== 'unix:///var/run/docker.sock') {
        throw new RuntimeException('Local WSL Docker engine required.');
    }
    $loaded = trim($run([PHP_BINARY, '-r', 'echo extension_loaded("pdo_pgsql") ? "yes" : "no";'])) === 'yes';
    $php = [PHP_BINARY, ...($loaded ? [] : ['-d', 'extension=pdo_pgsql']), 'scripts/server-recovery-probe.php'];
    foreach ($specs as $engine => $spec) {
        fwrite(STDOUT, "Starting isolated $engine source and restore target.\n");
        $environments = []; $names = [];
        foreach (['source', 'target'] as $role) {
            $name = ServerRecoverySupport::name($scope, $engine, $role);
            $names[$role] = $name;
            $password = bin2hex(random_bytes(24));
            $variables = $engine === 'pgsql'
                ? ['POSTGRES_USER=foundationqa', 'POSTGRES_PASSWORD='.$password, 'POSTGRES_DB='.$database]
                : ['MYSQL_USER=foundationqa', 'MYSQL_PASSWORD='.$password, 'MYSQL_DATABASE='.$database, 'MYSQL_ROOT_PASSWORD='.bin2hex(random_bytes(24))];
            $args = [...$docker, 'run', '-d', '--name', $name, '--label', 'foundation.recovery.scope='.$scope,
                '--label', 'foundation.recovery.role='.$role, '--read-only', '--security-opt', 'no-new-privileges',
                '--cap-drop', 'ALL', '--cap-add', 'CHOWN', '--cap-add', 'DAC_OVERRIDE', '--cap-add', 'FOWNER', '--cap-add', 'SETGID', '--cap-add', 'SETUID',
                '--memory', '1g', '--cpus', '1', '--pids-limit', '256', '-p', '127.0.0.1::'.$spec['port'],
                '--env-file', '/dev/stdin', '--tmpfs', '/tmp:rw,size=64m'];
            $args = $engine === 'pgsql'
                ? [...$args, '--tmpfs', '/var/lib/postgresql:rw,size=256m', '--tmpfs', '/var/run/postgresql:rw,size=8m', $spec['image']]
                : [...$args, '--tmpfs', '/var/lib/mysql:rw,size=512m', '--tmpfs', '/var/run/mysqld:rw,size=8m', $spec['image'], '--mysqlx=0', '--skip-log-bin'];
            $id = trim($run($args, implode("\n", $variables)."\n", [], 240));
            if (!preg_match('/\A[0-9a-f]{64}\z/D', $id)) throw new RuntimeException('Invalid container identity.');
            $active[$name] = ['id' => $id, 'engine' => $engine, 'role' => $role];
            $item = json_decode($run([...$docker, 'inspect', $name]), true, 64, JSON_THROW_ON_ERROR)[0];
            ServerRecoverySupport::assertOwned($item, $scope, $engine, $role);
            $binding = $item['NetworkSettings']['Ports'][$spec['port'].'/tcp'][0];
            if ($binding['HostIp'] !== '127.0.0.1') throw new RuntimeException('Nonlocal binding rejected.');
            $environments[$role] = ['FOUNDATION_RECOVERY_SCOPE' => $scope, 'APP_ENV' => 'testing', 'APP_DEBUG' => 'false',
                'APP_KEY' => 'base64:'.base64_encode(random_bytes(32)), 'LOG_CHANNEL' => 'null',
                'APP_CONFIG_CACHE' => $working.'/'.$engine.'-'.$role.'-unused-config.php',
                'APP_ROUTES_CACHE' => $working.'/'.$engine.'-'.$role.'-unused-routes.php',
                'DB_CONNECTION' => $engine, 'DB_HOST' => '127.0.0.1', 'DB_PORT' => $binding['HostPort'],
                'DB_DATABASE' => $database, 'DB_USERNAME' => 'foundationqa', 'DB_PASSWORD' => $password, 'DB_SSLMODE' => 'disable'];
            if ($engine === 'mysql') {
                $script = <<<'SH'
#!/bin/sh
set -eu
umask 077
printf '[client]\nuser=%s\npassword=%s\n' "$MYSQL_USER" "$MYSQL_PASSWORD" > /tmp/foundation-recovery.cnf
exec "$@"
SH;
                $run([...$docker, 'exec', '-i', $name, 'tee', '/tmp/foundation-recovery-client.sh'], $script."\n");
            }
        }
        $probe = static function (string $role, string $operation, array $input = []) use ($run, $php, $environments): array {
            return json_decode($run([...$php, $operation], json_encode((object) $input, JSON_THROW_ON_ERROR), $environments[$role], 20), true, 32, JSON_THROW_ON_ERROR);
        };
        foreach (['source', 'target'] as $role) {
            $ready = null; $deadline = microtime(true)+110;
            while (microtime(true)<$deadline) {
                try { $ready = $probe($role, 'ready'); break; } catch (Throwable) { usleep(500000); }
            }
            if ($ready === null) throw new RuntimeException('Timed out waiting for isolated '.$engine.' '.$role.'.');
            $versions[$role] = $ready['version'];
        }
        $token = bin2hex(random_bytes(32));
        $seed = $probe('source', 'seed', ['token' => $token]);
        $fingerprint = $probe('source', 'fingerprint');
        ServerRecoverySupport::assertEmpty($probe('target', 'empty')['tables']);
        $start = hrtime(true);
        $dump = $run([...$docker, 'exec', $names['source'], ...ServerRecoverySupport::dump($scope, $engine)]);
        $manifest = ['format' => 1, 'engine' => $engine, 'createdAt' => gmdate('c'), 'sha256' => hash('sha256', $dump),
            'bytes' => strlen($dump), 'logicalSha256' => $fingerprint['logicalSha256'], 'snapshotMs' => round((hrtime(true)-$start)/1e6, 3)];
        ServerRecoverySupport::verify($dump, $manifest, $engine);
        $backupPath = $working.'/'.$engine.'.backup';
        $handle = fopen($backupPath, 'x+b');
        if ($handle === false) throw new RuntimeException('Cannot reserve private dump file.');
        try {
            if (fwrite($handle, $dump) !== strlen($dump) || !fflush($handle) || !fsync($handle)) throw new RuntimeException('Dump write failed.');
        } finally { fclose($handle); }
        file_put_contents($working.'/'.$engine.'-manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
        $later = $probe('source', 'mutate', ['token' => $token, 'taskId' => $seed['taskId']]);
        $onDisk = file_get_contents($backupPath);
        ServerRecoverySupport::verify($onDisk, $manifest, $engine);
        ServerRecoverySupport::assertEmpty($probe('target', 'empty')['tables']);
        $start = hrtime(true);
        $run([...$docker, 'exec', '-i', $names['target'], ...ServerRecoverySupport::restore($scope, $engine)], $onDisk);
        $restoreMs = round((hrtime(true)-$start)/1e6, 3);
        $restoredFingerprint = $probe('target', 'fingerprint');
        if ($restoredFingerprint !== $fingerprint) throw new RuntimeException('Restored logical data or table-count mismatch.');
        $evidence = $probe('target', 'sanitize-and-probe', ['token' => $token, 'taskId' => $seed['taskId'], 'laterId' => $later['laterId']]);
        if ($probe('source', 'source-unchanged', ['token' => $token, 'taskId' => $seed['taskId'], 'laterId' => $later['laterId']])['sourceUnchanged'] !== true) {
            throw new RuntimeException('Source changed during restoration.');
        }
        $refused = false;
        try { ServerRecoverySupport::assertEmpty($probe('target', 'empty')['tables']); } catch (RuntimeException) { $refused = true; }
        if (!$refused) throw new RuntimeException('Populated target was not refused.');
        $report['engines'][$engine] = [...$evidence, 'image' => $spec['image'], 'versions' => $versions,
            'snapshotBytes' => $manifest['bytes'], 'snapshotMs' => $manifest['snapshotMs'], 'restoreMs' => $restoreMs,
            'logicalMatch' => true, 'sourceUnchanged' => true, 'populatedTargetRefused' => true];
        unset($dump, $onDisk, $token, $environments);
        $cleanup($names['target']); $cleanup($names['source']);
        fwrite(STDOUT, "PASS $engine native backup, separate restore, ownership and credential invalidation.\n");
    }
    $report['success'] = true;
} catch (Throwable $error) {
    $report['error'] = $error->getMessage();
    fwrite(STDERR, $error->getMessage().PHP_EOL);
} finally {
    foreach (array_reverse(array_keys($active)) as $name) {
        try { $cleanup($name); } catch (Throwable) { $report['success'] = false; $report['cleanupErrors'][] = $name; }
    }
    // Only this invocation's fixed dump filenames are removed; sanitized evidence remains.
    foreach (['pgsql.backup', 'mysql.backup'] as $file) {
        $path = $working.'/'.$file;
        if (is_file($path) && !is_link($path) && !unlink($path)) { $report['success'] = false; $report['cleanupErrors'][] = 'dump-removal'; }
    }
    $report['finishedAt'] = gmdate('c');
    file_put_contents($working.'/report.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
    fwrite(STDOUT, 'Recovery report: .validation/recovery-'.$scope.'/report.json'.PHP_EOL);
}
exit($report['success'] ? 0 : 1);
