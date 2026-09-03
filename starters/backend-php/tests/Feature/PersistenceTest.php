<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace Tests\Feature;

use App\Application\TaskRepository;
use App\Domain\Task;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

final class PersistenceTest extends TestCase
{
    private const ID = '11111111-1111-4111-8111-111111111111';

    public function test_committed_data_survives_connection_recreation(): void
    {
        $repository = $this->app->make(TaskRepository::class);
        $repository->insert(new Task(self::ID, "Café 'quoted' 🙂"));
        DB::purge();
        self::assertSame("Café 'quoted' 🙂", $repository->find(self::ID)->title);
        self::assertFalse($repository->find(self::ID)->completed);
        self::assertSame(1, $repository->find(self::ID)->version);
    }

    public function test_parameter_binding_preserves_sql_like_text(): void
    {
        $text = "'); DROP TABLE tasks; --";
        $this->app->make(TaskRepository::class)->insert(new Task(self::ID, $text));
        self::assertSame($text, $this->app->make(TaskRepository::class)->find(self::ID)->title);
        $this->assertDatabaseCount('tasks', 1);
    }

    public function test_duplicate_primary_key_is_rejected(): void
    {
        $repository = $this->app->make(TaskRepository::class);
        $repository->insert(new Task(self::ID, 'First'));
        try {
            $repository->insert(new Task(self::ID, 'Duplicate'));
            self::fail('Duplicate identifier was accepted.');
        } catch (QueryException) {
            self::assertSame('First', $repository->find(self::ID)->title);
            $this->assertDatabaseCount('tasks', 1);
        }
    }

    public function test_transaction_rolls_back_on_error(): void
    {
        try {
            DB::transaction(function (): void {
                $this->app->make(TaskRepository::class)->insert(new Task(self::ID, 'Uncommitted'));
                throw new \RuntimeException('deliberate-test-rollback');
            });
            self::fail('Transaction did not throw.');
        } catch (\RuntimeException $error) {
            self::assertSame('deliberate-test-rollback', $error->getMessage());
        }
        self::assertNull($this->app->make(TaskRepository::class)->find(self::ID));
    }

    public function test_conditional_update_rejects_an_outdated_snapshot(): void
    {
        $repository = $this->app->make(TaskRepository::class);
        $repository->insert(new Task(self::ID, 'Initial'));
        $snapshot = $repository->find(self::ID);
        self::assertTrue($repository->replaceIfVersion(new Task(self::ID, 'Winner', true, 2), $snapshot->version));
        self::assertFalse($repository->replaceIfVersion(new Task(self::ID, 'Stale', false, 2), $snapshot->version));
        self::assertFalse($repository->deleteIfVersion(self::ID, $snapshot->version));
        self::assertSame('Winner', $repository->find(self::ID)->title);
    }

    public function test_migration_upgrade_preserves_existing_rows_and_sets_defaults(): void
    {
        $this->artisan('migrate:rollback', ['--step' => 3, '--force' => true])->assertExitCode(0);
        DB::table('tasks')->insert(['id' => self::ID, 'title' => 'Legacy']);
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        self::assertNull($this->app->make(TaskRepository::class)->find(self::ID));
        $row = DB::table('tasks')->where('id', self::ID)->first();
        self::assertSame('Legacy', $row->title);
        self::assertFalse((bool) $row->completed);
        self::assertSame(1, (int) $row->version);
        self::assertNull($row->owner_id);
    }

    public function test_database_not_null_constraint_is_active(): void
    {
        $this->expectException(QueryException::class);
        DB::table('tasks')->insert(['id' => self::ID, 'title' => null]);
    }
}
