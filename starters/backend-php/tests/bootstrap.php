<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';

// Never read a consumer database location from .env. Every test process gets an
// owned SQLite file or an explicitly identified disposable server database.
$testToken = bin2hex(random_bytes(8));
$temporaryParent = realpath(sys_get_temp_dir());
$temporaryRoot = $temporaryParent.DIRECTORY_SEPARATOR.'foundation-php-test-'.$testToken;
if (!mkdir($temporaryRoot, 0700)) throw new RuntimeException('Cannot create test directory.');
$set = static function (string $key, string $value): void {
    putenv("$key=$value");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
};
$set('APP_ENV', 'testing');
$set('APP_DEBUG', 'false');
$set('APP_LOCALE', 'en-US');
$set('APP_KEY', 'base64:'.base64_encode(random_bytes(32)));
$set('APP_CONFIG_CACHE', $temporaryRoot.'/unused-config.php');
$set('APP_ROUTES_CACHE', $temporaryRoot.'/unused-routes.php');
$set('LOG_CHANNEL', 'null');
$driver = getenv('FOUNDATION_TEST_DRIVER') ?: 'sqlite';
if (!in_array($driver, ['sqlite', 'mysql', 'pgsql'], true)) throw new RuntimeException('Unknown test driver.');
$set('DB_CONNECTION', $driver);
if ($driver === 'sqlite') {
    $databaseFile = $temporaryRoot.'/test.sqlite';
    $handle = fopen($databaseFile, 'x');
    if ($handle === false) throw new RuntimeException('Cannot create test database.');
    fclose($handle);
    $set('DB_DATABASE', $databaseFile);
} else {
    $scope = getenv('FOUNDATION_TEST_ISOLATED') ?: '';
    $database = getenv('FOUNDATION_TEST_DATABASE') ?: '';
    $port = getenv('FOUNDATION_TEST_PORT') ?: '';
    if (!preg_match('/\A[0-9a-f]{16}\z/D', $scope) || $database !== 'foundation_qa_'.$scope
        || $port !== ($driver === 'mysql' ? '13306' : '15432')
        || !(getenv('FOUNDATION_TEST_PASSWORD') ?: '')) {
        throw new RuntimeException('Refusing tests without an explicitly identified isolated database.');
    }
    $set('DB_HOST', '127.0.0.1');
    $set('DB_PORT', $port);
    $set('DB_DATABASE', $database);
    $set('DB_USERNAME', 'foundationqa');
    $set('DB_PASSWORD', getenv('FOUNDATION_TEST_PASSWORD'));
    $set('DB_SSLMODE', 'disable'); // Only the disposable loopback QA instance.
}
if (!in_array($driver, PDO::getAvailableDrivers(), true)) throw new RuntimeException('The selected PDO test driver is unavailable.');
register_shutdown_function(static function () use ($temporaryParent, $temporaryRoot): void {
    if (is_link($temporaryRoot) || realpath(dirname($temporaryRoot)) !== $temporaryParent
        || !str_starts_with(basename($temporaryRoot), 'foundation-php-test-')) return;
    foreach (['test.sqlite', 'test.sqlite-wal', 'test.sqlite-shm', 'test.sqlite-journal'] as $file) {
        $target = $temporaryRoot.DIRECTORY_SEPARATOR.$file;
        if (is_file($target) && !is_link($target) && !@unlink($target)) {
            fwrite(STDERR, "Failed to remove an owned temporary test database; inspect the test temporary directory.\n");
            exit(1);
        }
    }
    if (scandir($temporaryRoot) === ['.', '..']) rmdir($temporaryRoot);
});
