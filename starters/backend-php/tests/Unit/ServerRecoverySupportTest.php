<?php
declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use RuntimeException;
use ServerRecoverySupport;

require_once __DIR__.'/../../scripts/server-recovery-support.php';

final class ServerRecoverySupportTest extends TestCase
{
    private const SCOPE = '0123456789abcdef';
    public function test_native_plans_keep_restore_scoped_and_do_not_drop_existing_databases(): void
    {
        foreach (['pgsql', 'mysql'] as $engine) {
            $dump = ServerRecoverySupport::dump(self::SCOPE, $engine);
            $restore = ServerRecoverySupport::restore(self::SCOPE, $engine);
            self::assertStringContainsString(ServerRecoverySupport::database(self::SCOPE), implode(' ', $dump));
            self::assertStringContainsString(ServerRecoverySupport::database(self::SCOPE), implode(' ', $restore));
            foreach (['--clean', '--create', '--force', '--databases', '--all-databases'] as $unsafe) {
                self::assertNotContains($unsafe, $dump); self::assertNotContains($unsafe, $restore);
            }
        }
        self::assertContains('--format=custom', ServerRecoverySupport::dump(self::SCOPE, 'pgsql'));
        self::assertContains('--single-transaction', ServerRecoverySupport::restore(self::SCOPE, 'pgsql'));
        self::assertContains('--exit-on-error', ServerRecoverySupport::restore(self::SCOPE, 'pgsql'));
        self::assertContains('--single-transaction', ServerRecoverySupport::dump(self::SCOPE, 'mysql'));
        self::assertContains('--no-tablespaces', ServerRecoverySupport::dump(self::SCOPE, 'mysql'));
    }
    public function test_bad_scope_engine_and_role_are_rejected(): void
    {
        foreach ([['../escape', 'pgsql', 'source'], [self::SCOPE, 'sqlite', 'source'], [self::SCOPE, 'pgsql', 'production']] as $case) {
            try { ServerRecoverySupport::name(...$case); self::fail('Unsafe profile accepted.'); }
            catch (RuntimeException) { self::assertTrue(true); }
        }
    }
    public function test_only_exact_container_name_scope_and_role_are_accepted(): void
    {
        $item = ['Name' => '/'.ServerRecoverySupport::name(self::SCOPE, 'pgsql', 'target'),
            'Config' => ['Labels' => ['foundation.recovery.scope' => self::SCOPE, 'foundation.recovery.role' => 'target']]];
        ServerRecoverySupport::assertOwned($item, self::SCOPE, 'pgsql', 'target');
        foreach ([[], [...$item, 'Name' => '/user-database'], [...$item, 'Config' => ['Labels' => []]]] as $bad) {
            try { ServerRecoverySupport::assertOwned($bad, self::SCOPE, 'pgsql', 'target'); self::fail('Foreign container accepted.'); }
            catch (RuntimeException) { self::assertTrue(true); }
        }
    }
    public function test_nonempty_restore_targets_are_always_rejected(): void
    {
        ServerRecoverySupport::assertEmpty(0);
        $this->expectException(RuntimeException::class);
        ServerRecoverySupport::assertEmpty(1);
    }
    public function test_binary_checksums_do_not_trim_data_and_reject_engine_or_content_changes(): void
    {
        $bytes = "\0\nPGDMP synthetic\r\n";
        $manifest = ['format' => 1, 'engine' => 'pgsql', 'bytes' => strlen($bytes), 'sha256' => hash('sha256', $bytes)];
        ServerRecoverySupport::verify($bytes, $manifest, 'pgsql');
        foreach ([[trim($bytes), $manifest, 'pgsql'], [$bytes, $manifest, 'mysql'],
            [$bytes, [...$manifest, 'sha256' => str_repeat('0', 64)], 'pgsql'], ['', $manifest, 'pgsql']] as $bad) {
            try { ServerRecoverySupport::verify(...$bad); self::fail('Invalid backup accepted.'); }
            catch (RuntimeException) { self::assertTrue(true); }
        }
    }
}
