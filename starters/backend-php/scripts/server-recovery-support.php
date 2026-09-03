<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

/** Pure native-tool plans and safety guards for the isolated server recovery profile. */
final class ServerRecoverySupport
{
    public static function database(string $scope): string
    {
        if (!preg_match('/\A[0-9a-f]{16}\z/D', $scope)) throw new RuntimeException('Invalid recovery scope.');
        return 'foundation_recovery_'.$scope;
    }

    public static function name(string $scope, string $engine, string $role): string
    {
        self::database($scope);
        if (!in_array($engine, ['pgsql', 'mysql'], true) || !in_array($role, ['source', 'target'], true)) {
            throw new RuntimeException('Invalid recovery profile.');
        }
        return 'foundation-recovery-'.$engine.'-'.$role.'-'.$scope;
    }

    public static function assertOwned(array $inspection, string $scope, string $engine, string $role): void
    {
        if (($inspection['Name'] ?? '') !== '/'.self::name($scope, $engine, $role)
            || ($inspection['Config']['Labels']['foundation.recovery.scope'] ?? '') !== $scope
            || ($inspection['Config']['Labels']['foundation.recovery.role'] ?? '') !== $role) {
            throw new RuntimeException('Refusing a container without matching recovery ownership.');
        }
    }

    public static function assertEmpty(int $tableCount): void
    {
        if ($tableCount !== 0) throw new RuntimeException('Restore target must be empty; no overwrite allowed.');
    }

    public static function dump(string $scope, string $engine): array
    {
        $database = self::database($scope);
        return match ($engine) {
            'pgsql' => ['pg_dump', '--username=foundationqa', '--format=custom', '--no-owner', '--no-acl', $database],
            'mysql' => ['sh', '/tmp/foundation-recovery-client.sh', 'mysqldump', '--defaults-extra-file=/tmp/foundation-recovery.cnf',
                '--single-transaction', '--quick', '--skip-lock-tables', '--no-tablespaces', '--set-gtid-purged=OFF',
                '--hex-blob', '--column-statistics=0', $database],
            default => throw new RuntimeException('Unsupported recovery engine.'),
        };
    }

    public static function restore(string $scope, string $engine): array
    {
        $database = self::database($scope);
        return match ($engine) {
            'pgsql' => ['pg_restore', '--username=foundationqa', '--no-owner', '--no-acl', '--exit-on-error', '--single-transaction', '--dbname='.$database],
            'mysql' => ['sh', '/tmp/foundation-recovery-client.sh', 'mysql', '--defaults-extra-file=/tmp/foundation-recovery.cnf', '--binary-mode', $database],
            default => throw new RuntimeException('Unsupported recovery engine.'),
        };
    }

    public static function verify(string $bytes, array $manifest, string $engine): void
    {
        if (($manifest['format'] ?? null) !== 1 || ($manifest['engine'] ?? null) !== $engine
            || ($manifest['bytes'] ?? null) !== strlen($bytes) || strlen($bytes) === 0
            || !is_string($manifest['sha256'] ?? null) || !hash_equals($manifest['sha256'], hash('sha256', $bytes))) {
            throw new RuntimeException('Backup integrity or engine mismatch.');
        }
    }
}
