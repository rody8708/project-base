import { expect, test, vi } from 'vitest';
import { createHttpTaskRepository } from './http-task-repository';
const row = { id: '11111111-1111-4111-8111-111111111111', title: 'Remote', completed: false, version: 1 };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
test('HTTP repository preserves unknown timestamp and version snapshot', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response({ data: [row], next_after: row.id }))
    .mockResolvedValueOnce(response({ data: [], next_after: null }))
    .mockResolvedValueOnce(response({ data: { ...row, completed: true, version: 2 } }));
  vi.stubGlobal('fetch', fetcher);
  try {
    const repository = createHttpTaskRepository('http://127.0.0.1:8000/api/v1');
    const listed = await repository.list();
    expect(listed.ok && listed.value[0]?.createdAtEpochMs).toBeNull();
    const result = await repository.update(row.id, task => ({ ...task, completed: true }));
    expect(result.ok && result.value.completed).toBe(true);
    expect(JSON.parse(fetcher.mock.calls[2]?.[1].body)).toEqual({ title: 'Remote', completed: true, version: 1 });
  } finally { vi.unstubAllGlobals(); }
});
test('failed writes do not create synthetic confirmed records or retry', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('disconnected'));
  vi.stubGlobal('fetch', fetcher);
  try {
    const repository = createHttpTaskRepository('http://127.0.0.1:8000/api/v1');
    expect(await repository.add({ id: 'local', title: 'Task', completed: false, createdAtEpochMs: 1 }))
      .toEqual({ ok: false, error: { code: 'STORAGE_UNAVAILABLE' } });
    expect(fetcher).toHaveBeenCalledTimes(1);
  } finally { vi.unstubAllGlobals(); }
});
