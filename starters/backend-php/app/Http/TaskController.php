<?php
declare(strict_types=1);

namespace App\Http;

use App\Application\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

final readonly class TaskController
{
    public function __construct(private TaskService $tasks) {}

    private function payload(Request $request, array $rules): array
    {
        $body = $request->json()->all();
        if (array_diff(array_keys($body), array_keys($rules))) throw ValidationException::withMessages(['body' => ['unknown_fields']]);
        $validated = Validator::make($body, $rules)->validate();
        if (array_key_exists('completed', $validated) && !is_bool($validated['completed'])) {
            throw ValidationException::withMessages(['completed' => ['boolean_required']]);
        }
        if (array_key_exists('version', $validated) && !is_int($validated['version'])) {
            throw ValidationException::withMessages(['version' => ['integer_required']]);
        }
        return $validated;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Validator::make($request->query(), [
            'limit' => ['sometimes', 'integer', 'between:1,100'], 'after' => ['sometimes', 'string', 'uuid'],
        ])->validate();
        $items = $this->tasks->list((int) ($query['limit'] ?? 20), $query['after'] ?? null);
        return response()->json(['data' => array_map(fn ($task) => $task->toArray(), $items),
            'next_after' => $items === [] ? null : $items[array_key_last($items)]->id]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => $this->tasks->get($id)->toArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $body = $this->payload($request, ['title' => ['required', 'string']]);
        $task = $this->tasks->create($body['title']);
        return response()->json(['data' => $task->toArray()], 201, ['Location' => '/api/v1/tasks/'.$task->id]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $body = $this->payload($request, ['title' => ['required', 'string'], 'completed' => ['required', 'boolean'],
            'version' => ['required', 'integer', 'between:1,2147483645']]);
        return response()->json(['data' => $this->tasks->replace($id, $body['title'], $body['completed'], $body['version'])->toArray()]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $body = $this->payload($request, ['version' => ['required', 'integer', 'between:1,2147483646']]);
        $this->tasks->delete($id, $body['version']);
        return response()->json(null, 204);
    }
}
