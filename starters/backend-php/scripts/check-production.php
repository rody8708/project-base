<?php
declare(strict_types=1);

// Read-only; never migrates, changes configuration, or prints configuration values.
require __DIR__.'/../vendor/autoload.php';
$checks = [];
try {
    $app = require __DIR__.'/../bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $checks = \App\Application\ProductionPolicy::failures(\App\Infrastructure\ProductionSettings::current());
    if (!$app->configurationIsCached()) $checks[] = 'CONFIGURATION_NOT_CACHED';
    if (!$app->routesAreCached()) $checks[] = 'ROUTES_NOT_CACHED';
    if (is_dir(__DIR__.'/../vendor/phpunit')) $checks[] = 'DEVELOPMENT_DEPENDENCIES_PRESENT';
    $public = realpath(__DIR__.'/../public');
    if ($public === false || is_link(__DIR__.'/../public')) $checks[] = 'INVALID_PUBLIC_ROOT';
    else {
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($public, FilesystemIterator::SKIP_DOTS)) as $file) {
            if ($file->isLink() || $file->getBasename() !== 'index.php') { $checks[] = 'UNREVIEWED_PUBLIC_FILE'; break; }
        }
    }
    if (!$app->make('migration.repository')->repositoryExists()) $checks[] = 'MIGRATIONS_NOT_APPLIED';
    else {
        $pending = array_diff(array_keys($app->make('migrator')->getMigrationFiles(database_path('migrations'))),
            $app->make('migration.repository')->getRan());
        if ($pending) $checks[] = 'MIGRATIONS_PENDING';
    }
    if ($app->make('db')->table('tasks')->whereNull('owner_id')->exists()) $checks[] = 'UNASSIGNED_LEGACY_DATA';
} catch (Throwable) { $checks[] = 'BOOT_OR_DATABASE_CHECK_FAILED'; }
echo json_encode(['result' => $checks ? 'BLOCKED' : 'LOCAL_CHECKS_PASS', 'failures' => array_values(array_unique($checks)),
    'productionApproved' => false,
    'externalEvidenceRequired' => ['deployed-TLS-and-proxy', 'dependency-audits', 'backup-restore', 'load-and-rate-limits',
        'monitoring-and-alerts', 'secret-rotation', 'security-review', 'release-owner-approval']], JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR).PHP_EOL;
exit($checks ? 1 : 0);
