<?php
declare(strict_types=1);

// Pure guards shared by the isolated runner and its unit tests; no I/O here.
final class FoundationQaSupport
{
    public static function phpunitCommand(string $binary, bool $pgsqlAlreadyLoaded): array
    {
        return [$binary, ...($pgsqlAlreadyLoaded ? [] : ['-d', 'extension=pdo_pgsql']),
            'vendor/phpunit/phpunit/phpunit', '--colors=never'];
    }

    public static function output(int $exitCode, string $stdout, string $stderr, bool $requireQuietStderr): string
    {
        if ($exitCode !== 0) throw new RuntimeException('QA child command failed.');
        if ($requireQuietStderr && trim($stderr) !== '') {
            throw new RuntimeException('QA PHP command emitted stderr; a clean run is required.');
        }
        return trim($stdout);
    }

    public static function assertOwnedContainer(bool $inspectionSucceeded, string $label, string $name, string $scope): void
    {
        if (!$inspectionSucceeded) throw new RuntimeException('Container inspection failed; cleanup cannot be confirmed.');
        if (!preg_match('/\A[0-9a-f]{16}\z/D', $scope) || trim($label) !== $scope
            || !in_array($name, ['foundation-php-pgsql-'.$scope, 'foundation-php-mysql-'.$scope], true)) {
            throw new RuntimeException('Container ownership check failed; no removal attempted.');
        }
    }
}
