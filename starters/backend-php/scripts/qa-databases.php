<?php
declare(strict_types=1);

// Explicit Windows/WSL QA only. No user database or existing container is used.
use Symfony\Component\Process\Process;

require __DIR__.'/../vendor/autoload.php';
require __DIR__.'/qa-support.php';
if ($argc !== 2 || $argv[1] !== '--wsl-docker' || PHP_OS_FAMILY !== 'Windows') {
    fwrite(STDERR, "Usage on Windows: php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker\n"); exit(1);
}
foreach (['sqlite', 'mysql', 'pgsql'] as $driver) {
    if (!in_array($driver, PDO::getAvailableDrivers(), true)) {
        fwrite(STDERR, "All three PDO drivers must be enabled for this process.\n"); exit(1);
    }
}
$base = realpath(dirname(__DIR__));
$scope = bin2hex(random_bytes(8));
$working = $base.'/.validation/'.$scope;
if (!is_dir($base.'/.validation') && !mkdir($base.'/.validation', 0700)) throw new RuntimeException('Cannot create QA parent.');
if (is_link($base.'/.validation')) throw new RuntimeException('QA parent must not be linked.');
if (!mkdir($working, 0700)) throw new RuntimeException('Cannot create QA directory.');
$docker = ['wsl.exe', '-d', 'Ubuntu-24.04', '--', 'docker'];
$run = static function (array $command, array $environment = [], int $timeout = 120, ?string $input = null, bool $requireQuietStderr = false) use ($base): string {
    $process = new Process($command, $base, $environment, $input, $timeout);
    $process->run();
    return FoundationQaSupport::output($process->getExitCode() ?? -1, $process->getOutput(), $process->getErrorOutput(), $requireQuietStderr);
};
$names = [];
$summary = static function (string $output): string {
    if (preg_match('/\b(?:Warning|Deprecated|Fatal error|Notice):/u', $output)
        || !preg_match('/^OK \(\d+ tests, \d+ assertions\)\r?$/m', $output, $match)) {
        throw new RuntimeException('The test run did not finish with a clean PHPUnit success summary.');
    }
    return trim($match[0]);
};
$report = ['kind' => 'isolated-backend-verification', 'templateRevision' => '1.1.0-draft.1',
    'approved' => false, 'startedAt' => gmdate(DATE_ATOM), 'php' => PHP_VERSION, 'platform' => PHP_OS_FAMILY,
    'scope' => $scope, 'databases' => [], 'containersRemoved' => [], 'success' => false];
$specs = [
    'pgsql' => ['tag' => 'postgres:18.6-bookworm', 'digest' => 'sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af', 'port' => 15432, 'internalPort' => 5432],
    'mysql' => ['tag' => 'mysql:8.4.11', 'digest' => 'sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb', 'port' => 13306, 'internalPort' => 3306],
];
try {
    // Parent -d options are not inherited. Probe a clean child to avoid loading
    // pdo_pgsql twice when the consumer already enabled it in php.ini.
    $probe = $run([PHP_BINARY, '-r', 'echo extension_loaded("pdo_pgsql") ? "loaded" : "missing";'], [], 120, null, true);
    if (!in_array($probe, ['loaded', 'missing'], true)) throw new RuntimeException('Unexpected PHP extension probe result.');
    $phpunit = FoundationQaSupport::phpunitCommand(PHP_BINARY, $probe === 'loaded');
    $endpoint = $run([...$docker, 'context', 'inspect', '--format', '{{.Endpoints.docker.Host}}']);
    if ($endpoint !== 'unix:///var/run/docker.sock') throw new RuntimeException('Only the verified local WSL Docker socket is accepted.');
    $report['docker'] = $run([...$docker, 'version', '--format', '{{.Server.Version}}']);
    foreach ($specs as $spec) {
        $socket = @fsockopen('127.0.0.1', $spec['port'], $errorCode, $errorMessage, 1);
        if ($socket !== false) { fclose($socket); throw new RuntimeException('A required Windows loopback port is occupied.'); }
        $listeners = $run(['wsl.exe', '-d', 'Ubuntu-24.04', '--', 'ss', '-H', '-ltn']);
        if (preg_match('/:'.$spec['port'].'\s/', $listeners)) throw new RuntimeException('A required WSL loopback port is occupied.');
    }
    $sqliteOutput = $run($phpunit, ['FOUNDATION_TEST_DRIVER' => 'sqlite'], 120, null, true);
    file_put_contents($working.'/sqlite.txt', $sqliteOutput);
    $sqlite = new PDO('sqlite::memory:');
    $report['databases']['sqlite'] = ['version' => $sqlite->query('select sqlite_version()')->fetchColumn(),
        'result' => 'passed', 'summary' => $summary($sqliteOutput)];
    $sqlite = null;
    foreach ($specs as $driver => $spec) {
        $name = 'foundation-php-'.$driver.'-'.$scope;
        $password = bin2hex(random_bytes(24));
        $database = 'foundation_qa_'.$scope;
        $lines = $driver === 'pgsql'
            ? ['POSTGRES_USER=foundationqa', 'POSTGRES_PASSWORD='.$password, 'POSTGRES_DB='.$database]
            : ['MYSQL_USER=foundationqa', 'MYSQL_PASSWORD='.$password, 'MYSQL_DATABASE='.$database, 'MYSQL_ROOT_PASSWORD='.bin2hex(random_bytes(24))];
        $image = $spec['tag'].'@'.$spec['digest'];
        $run([...$docker, 'pull', $image], [], 240);
        $arguments = [...$docker, 'run', '--detach', '--name', $name, '--label', 'foundation.backend.qa='.$scope,
            '--read-only', '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL',
            '--cap-add', 'CHOWN', '--cap-add', 'DAC_OVERRIDE', '--cap-add', 'FOWNER', '--cap-add', 'SETGID', '--cap-add', 'SETUID',
            '--memory', '1g', '--cpus', '1', '--pids-limit', '256',
            '--publish', '127.0.0.1:'.$spec['port'].':'.$spec['internalPort'], '--env-file', '/dev/stdin',
            '--tmpfs', '/tmp:rw,size=64m'];
        if ($driver === 'pgsql') {
            $arguments = [...$arguments, '--tmpfs', '/var/lib/postgresql:rw,size=256m', '--tmpfs', '/var/run/postgresql:rw,size=8m', $image];
        } else {
            $arguments = [...$arguments, '--tmpfs', '/var/lib/mysql:rw,size=512m', '--tmpfs', '/var/run/mysqld:rw,size=8m', $image, '--mysqlx=0', '--skip-log-bin'];
        }
        $names[] = $name;
        $containerId = $run($arguments, [], 120, implode("\n", $lines)."\n");
        if (!preg_match('/\A[0-9a-f]{64}\z/D', $containerId)) throw new RuntimeException('Unexpected container identity.');
        $connected = null;
        $deadline = microtime(true) + 100;
        while (microtime(true) < $deadline) {
            try {
                $dsn = $driver === 'pgsql'
                    ? "pgsql:host=127.0.0.1;port={$spec['port']};dbname=$database;connect_timeout=2;sslmode=disable"
                    : "mysql:host=127.0.0.1;port={$spec['port']};dbname=$database;charset=utf8mb4";
                $connected = new PDO($dsn, 'foundationqa', $password, [PDO::ATTR_TIMEOUT => 2, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                break;
            } catch (PDOException) {
                usleep(500000);
            }
        }
        if ($connected === null) {
            $logs = new Process([...$docker, 'logs', $name], $base);
            $logs->run();
            file_put_contents($working.'/'.$driver.'-startup.txt', $logs->getOutput().$logs->getErrorOutput());
            throw new RuntimeException('Timed out waiting for the isolated '.$driver.' instance; startup log retained locally.');
        }
        $version = $connected->query('select version()')->fetchColumn();
        $connected = null;
        $testEnvironment = ['FOUNDATION_TEST_DRIVER' => $driver, 'FOUNDATION_TEST_ISOLATED' => $scope,
            'FOUNDATION_TEST_DATABASE' => $database, 'FOUNDATION_TEST_PORT' => (string) $spec['port'], 'FOUNDATION_TEST_PASSWORD' => $password];
        $output = $run($phpunit, $testEnvironment, 120, null, true);
        file_put_contents($working.'/'.$driver.'.txt', $output);
        $report['databases'][$driver] = ['version' => $version, 'image' => $image, 'containerId' => $containerId,
            'loopbackPort' => $spec['port'], 'result' => 'passed',
            'summary' => $summary($output)];
        fwrite(STDOUT, 'PASS isolated '.$driver."\n");
    }
    $report['success'] = true;
} catch (Throwable $error) {
    $report['error'] = $error->getMessage();
    fwrite(STDERR, $error->getMessage()."\n");
} finally {
    foreach (array_reverse($names) as $name) {
        try {
            $check = new Process([...$docker, 'inspect', '--format', '{{ index .Config.Labels "foundation.backend.qa" }}', $name], $base);
            $check->run();
            FoundationQaSupport::assertOwnedContainer($check->isSuccessful(), $check->getOutput(), $name, $scope);
            $remove = new Process([...$docker, 'rm', '--force', '--volumes', $name], $base);
            $remove->run();
            if (!$remove->isSuccessful()) throw new RuntimeException('Owned container removal failed.');
            $report['containersRemoved'][] = $name;
        } catch (Throwable $cleanupError) {
            $report['success'] = false;
            $report['cleanupErrors'][] = ['container' => $name, 'reason' => $cleanupError->getMessage()];
            fwrite(STDERR, "QA cleanup was not confirmed; inspect the local report before retrying.\n");
        }
    }
    $report['finishedAt'] = gmdate(DATE_ATOM);
    file_put_contents($working.'/report.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");
    fwrite(STDOUT, 'QA report: .validation/'.$scope."/report.json\n");
}
exit($report['success'] ? 0 : 1);
