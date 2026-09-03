<?php
declare(strict_types=1);

namespace Tests\Feature;

use App\Application\TaskRepository;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

final class ApiTest extends TestCase
{
    public function test_liveness_does_not_claim_database_readiness(): void
    {
        $this->getJson('/api/health')->assertOk()->assertExactJson(['status' => 'ok', 'scope' => 'liveness']);
    }

    public function test_crud_and_optimistic_concurrency(): void
    {
        $created = $this->postJson('/api/v1/tasks', ['title' => '  Primera tarea 🙂  '])->assertCreated();
        $id = $created->json('data.id');
        $created->assertJsonPath('data.title', 'Primera tarea 🙂')->assertJsonPath('data.completed', false)
            ->assertJsonPath('data.version', 1)->assertHeader('Location', '/api/v1/tasks/'.$id);
        $this->getJson('/api/v1/tasks/'.$id)->assertOk()->assertJsonPath('data.id', $id);
        $this->putJson('/api/v1/tasks/'.$id, ['title' => 'Done', 'completed' => true, 'version' => 1])
            ->assertOk()->assertJsonPath('data.completed', true)->assertJsonPath('data.version', 2);
        $this->putJson('/api/v1/tasks/'.$id, ['title' => 'Stale', 'completed' => false, 'version' => 1])
            ->assertStatus(409)->assertJsonPath('error.code', 'VERSION_CONFLICT');
        $this->deleteJson('/api/v1/tasks/'.$id, ['version' => 1])->assertStatus(409);
        $this->getJson('/api/v1/tasks/'.$id)->assertJsonPath('data.title', 'Done');
        $this->deleteJson('/api/v1/tasks/'.$id, ['version' => 2])->assertNoContent();
        $this->getJson('/api/v1/tasks/'.$id)->assertNotFound();
    }

    public function test_bounded_cursor_listing_is_stable_for_an_unchanged_dataset(): void
    {
        $ids = [];
        foreach (['A', 'B', 'C'] as $title) $ids[] = $this->postJson('/api/v1/tasks', ['title' => $title])->json('data.id');
        sort($ids, SORT_STRING);
        $first = $this->getJson('/api/v1/tasks?limit=2')->assertOk();
        self::assertSame(array_slice($ids, 0, 2), array_column($first->json('data'), 'id'));
        $this->getJson('/api/v1/tasks?limit=2&after='.$ids[1])->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ids[2]);
        $this->getJson('/api/v1/tasks?limit=0')->assertUnprocessable();
        $this->getJson('/api/v1/tasks?limit=101')->assertUnprocessable();
        $this->getJson('/api/v1/tasks?after=invalid')->assertUnprocessable();
    }

    public static function invalidPayloads(): array
    {
        return [[['title' => '']], [['title' => '   ']], [['title' => 12]], [['title' => []]],
            [['title' => str_repeat('á', 81)]], [['title' => 'valid', 'unexpected' => 'value']]];
    }

    #[DataProvider('invalidPayloads')]
    public function test_invalid_payloads_do_not_write(array $payload): void
    {
        $this->postJson('/api/v1/tasks', $payload)->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_FAILED');
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_json_booleans_and_versions_are_not_coerced(): void
    {
        $id = $this->postJson('/api/v1/tasks', ['title' => 'A'])->json('data.id');
        foreach ([['completed' => '1', 'version' => 1], ['completed' => true, 'version' => '1']] as $values) {
            $this->putJson('/api/v1/tasks/'.$id, ['title' => 'B', ...$values])->assertUnprocessable();
        }
        $this->getJson('/api/v1/tasks/'.$id)->assertJsonPath('data.version', 1)->assertJsonPath('data.completed', false);
    }

    public function test_missing_ids_and_routes_are_json_errors(): void
    {
        $this->getJson('/api/v1/tasks/11111111-1111-4111-8111-111111111111')->assertNotFound()->assertJsonPath('error.code', 'NOT_FOUND');
        $this->get('/api/v1/tasks/invalid')->assertNotFound()->assertHeader('Content-Type', 'application/json');
        $this->getJson('/unknown')->assertNotFound()->assertJsonPath('error.code', 'NOT_FOUND');
    }

    public function test_malformed_json_and_content_type_are_rejected(): void
    {
        $this->call('POST', '/api/v1/tasks', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{')
            ->assertStatus(400)->assertJsonPath('error.code', 'BAD_REQUEST');
        $this->call('POST', '/api/v1/tasks', [], [], [], ['CONTENT_TYPE' => 'application/json'], '[]')->assertStatus(400);
        $this->post('/api/v1/tasks', ['title' => 'A'])->assertStatus(415);
        $this->postJson('/api/v1/tasks', ['title' => str_repeat('a', 9000)])->assertStatus(413);
    }

    public function test_empty_json_object_is_a_contract_error(): void
    {
        $this->call('POST', '/api/v1/tasks', [], [], [], ['CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$this->issueToken('test-owner')], '{}')->assertUnprocessable();
        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_noncanonical_ids_are_rejected_consistently_before_database_lookup(): void
    {
        $id = 'abcdefab-abcd-4abc-8abc-abcdefabcdef';
        $this->app->make(TaskRepository::class)->insert(new \App\Domain\Task($id, 'Original'));
        $uppercase = strtoupper($id);
        $this->getJson('/api/v1/tasks/'.$uppercase)->assertUnprocessable();
        $this->putJson('/api/v1/tasks/'.$uppercase, ['title' => 'Changed', 'completed' => true, 'version' => 1])->assertUnprocessable();
        $this->deleteJson('/api/v1/tasks/'.$uppercase, ['version' => 1])->assertUnprocessable();
        $this->getJson('/api/v1/tasks?after='.$uppercase)->assertUnprocessable();
        $this->getJson('/api/v1/tasks/'.$id)->assertOk()->assertJsonPath('data.title', 'Original');
    }

    public function test_method_not_allowed_retains_allow_header(): void
    {
        $this->putJson('/api/health', ['example' => true])->assertStatus(405)->assertHeader('Allow', 'GET, HEAD')
            ->assertJsonPath('error.code', 'METHOD_NOT_ALLOWED');
    }

    public function test_translations_are_separate_and_errors_do_not_echo_private_input(): void
    {
        $response = $this->withHeaders(['Accept-Language' => 'es-419'])->postJson('/api/v1/tasks', ['title' => [], 'secret' => 'SYNTHETIC_PRIVATE_VALUE']);
        $response->assertUnprocessable()->assertHeader('Content-Language', 'es-419')
            ->assertJsonPath('error.message', 'Los valores proporcionados no cumplen el contrato.');
        self::assertStringNotContainsString('SYNTHETIC_PRIVATE_VALUE', $response->getContent());
        $this->withHeaders(['Accept-Language' => 'en-US'])->getJson('/unknown')
            ->assertJsonPath('error.message', 'The resource was not found.');
        self::assertSame(array_keys(require __DIR__.'/../../lang/en-US/api.php'), array_keys(require __DIR__.'/../../lang/es-419/api.php'));
    }

    public function test_unexpected_errors_do_not_expose_sql_paths_or_traces(): void
    {
        Route::get('/test-only-fault', fn () => throw new \RuntimeException('SYNTHETIC_PRIVATE_DETAIL'));
        $response = $this->getJson('/test-only-fault')->assertStatus(500)->assertJsonPath('error.code', 'INTERNAL_ERROR');
        self::assertStringNotContainsString('SYNTHETIC_PRIVATE_DETAIL', $response->getContent());
        self::assertSame(['error'], array_keys($response->json()));
        self::assertSame(['code', 'message'], array_keys($response->json('error')));
    }

    public function test_persistence_error_is_reported_without_a_successful_response(): void
    {
        $this->app->bind(TaskRepository::class, fn () => throw new \Illuminate\Database\QueryException(
            'synthetic', 'SYNTHETIC_PRIVATE_SQL', [], new \PDOException('SYNTHETIC_PRIVATE_DRIVER_DETAIL'),
        ));
        $response = $this->getJson('/api/v1/tasks')->assertStatus(503)->assertJsonPath('error.code', 'PERSISTENCE_UNAVAILABLE');
        self::assertStringNotContainsString('SYNTHETIC_PRIVATE', $response->getContent());
    }
}
