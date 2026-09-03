import assert from 'node:assert/strict';
import test from 'node:test';
import { createTaskApi, decodeTask } from '../src/adapters/task-api.js';
const id = '11111111-1111-4111-8111-111111111111';
const row = { id, title: 'Café 🙂', completed: false, version: 1 };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('bearer token is sent only in headers and a changed session needs a new adapter', async () => {
  let token = 'a'.repeat(64); let calls = 0;
  const api = createTaskApi('https://api.example.test/api/v1', async (url, options) => {
    calls++; assert.equal(options.headers.Authorization, 'Bearer ' + token);
    assert.equal(url.includes(token), false);
    return response({ data: [], next_after: null });
  }, 10000, () => token);
  await api.list(); token = 'b'.repeat(64);
  await assert.rejects(api.list(), { code: 'SESSION_CHANGED' }); assert.equal(calls, 1);
});

test('authentication, permission and rate failures are not retried', async () => {
  for (const [status, code] of [[401, 'UNAUTHENTICATED'], [403, 'FORBIDDEN'], [429, 'RATE_LIMITED']]) {
    let calls = 0;
    const api = createTaskApi('https://api.example.test/api/v1', async () => {
      calls++; return response({ error: { code } }, status);
    });
    await assert.rejects(api.list(), { code }); assert.equal(calls, 1);
  }
});
test('HTTP configuration rejects unsafe endpoints', () => {
  for (const url of ['http://example.com/api/v1', 'https://u:p@example.com/api/v1', 'https://example.com/api/v1?x=1']) assert.throws(() => createTaskApi(url));
});
test('wire DTO validates types and Unicode', () => {
  assert.deepEqual(decodeTask(row), row);
  for (const value of [{ ...row, version: '1' }, { ...row, completed: 1 }, { ...row, title: 'x'.repeat(81) }, { ...row, title: String.fromCharCode(0xd800) }, { ...row, id: id + String.fromCharCode(10) }]) {
    assert.throws(() => decodeTask(value));
  }
});
test('pagination follows cursors until empty without losing pages', async () => {
  const calls = [];
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', async url => {
    calls.push(url);
    return calls.length === 1 ? response({ data: [row], next_after: id }) : response({ data: [], next_after: null });
  });
  assert.deepEqual(await api.list(), [row]);
  assert.match(calls[1], /after=/);
});
test('repeated cursor or duplicate rows is rejected', async () => {
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', async () => response({ data: [row], next_after: id }));
  await assert.rejects(api.list(), { code: 'INVALID_RESPONSE' });
});
test('create sends only title and takes server identity', async () => {
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { title: row.title });
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return response({ data: row }, 201);
  });
  assert.deepEqual(await api.create(row.title), row);
});
test('conflicts are not retried', async () => {
  let calls = 0;
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', async () => {
    calls++; return response({ error: { code: 'VERSION_CONFLICT' } }, 409);
  });
  await assert.rejects(api.replace(row, true), { code: 'VERSION_CONFLICT' });
  assert.equal(calls, 1);
});
test('write timeout/disconnect/server error/malformed success are uncertain and never retried', async () => {
  for (const produce of [() => { throw new Error('offline'); }, () => response({}, 503), () => response({ data: {} }, 201)]) {
    let calls = 0;
    const api = createTaskApi('http://127.0.0.1:8000/api/v1', async () => { calls++; return produce(); });
    await assert.rejects(api.create('Task'), { code: 'OUTCOME_UNKNOWN' });
    assert.equal(calls, 1);
  }
});
test('timeout cancels transport', async () => {
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')));
  }), 5);
  await assert.rejects(api.create('Task'), { code: 'OUTCOME_UNKNOWN' });
});
test('oversized response is rejected', async () => {
  const api = createTaskApi('http://127.0.0.1:8000/api/v1', async () => response({ data: 'x'.repeat(1048577) }));
  await assert.rejects(api.list(), { code: 'INVALID_RESPONSE' });
});
