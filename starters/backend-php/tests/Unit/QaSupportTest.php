<?php
declare(strict_types=1);

namespace Tests\Unit;

use FoundationQaSupport;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use RuntimeException;

require_once __DIR__.'/../../scripts/qa-support.php';

final class QaSupportTest extends TestCase
{
    public function test_child_loads_pgsql_only_when_the_clean_process_needs_it(): void
    {
        self::assertSame(['php', 'vendor/phpunit/phpunit/phpunit', '--colors=never'], FoundationQaSupport::phpunitCommand('php', true));
        self::assertSame(['php', '-d', 'extension=pdo_pgsql', 'vendor/phpunit/phpunit/phpunit', '--colors=never'], FoundationQaSupport::phpunitCommand('php', false));
    }

    public function test_php_stderr_is_not_hidden_by_exit_zero(): void
    {
        $this->expectException(RuntimeException::class);
        FoundationQaSupport::output(0, 'OK (1 tests, 1 assertions)', 'PHP Warning: synthetic', true);
    }

    public function test_nonzero_exit_is_a_failure_even_with_success_text(): void
    {
        $this->expectException(RuntimeException::class);
        FoundationQaSupport::output(1, 'OK (1 tests, 1 assertions)', '', true);
    }

    public function test_normal_stdout_and_docker_progress_are_distinguished(): void
    {
        self::assertSame('passed', FoundationQaSupport::output(0, "passed\n", '', true));
        self::assertSame('digest', FoundationQaSupport::output(0, 'digest', 'synthetic pull progress', false));
    }

    #[DataProvider('unconfirmedOwnership')]
    public function test_unconfirmed_ownership_fails_closed(bool $inspected, string $label, string $name): void
    {
        $this->expectException(RuntimeException::class);
        FoundationQaSupport::assertOwnedContainer($inspected, $label, $name, '0123456789abcdef');
    }

    public static function unconfirmedOwnership(): array
    {
        return [
            'inspection failure' => [false, '0123456789abcdef', 'foundation-php-mysql-0123456789abcdef'],
            'different label' => [true, 'ffffffffffffffff', 'foundation-php-mysql-0123456789abcdef'],
            'different prefix' => [true, '0123456789abcdef', 'other-0123456789abcdef'],
        ];
    }

    public function test_only_an_exact_owned_name_and_label_can_be_removed(): void
    {
        FoundationQaSupport::assertOwnedContainer(true, "0123456789abcdef\n", 'foundation-php-pgsql-0123456789abcdef', '0123456789abcdef');
        self::addToAssertionCount(1);
    }
}
