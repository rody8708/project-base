// Framework-independent HTTP contract client. Keep both web copies identical.
export class ApiFailure extends Error {
  constructor(code) { super(code); this.code = code; }
}
const invalid = () => { throw new ApiFailure('INVALID_RESPONSE'); };
const uuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(v) && v.length === 36;
export function decodeTask(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || !uuid(value.id) || typeof value.title !== 'string'
      || value.title !== value.title.trim() || !value.title.length || [...value.title].length > 80
      || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(value.title)
      || !value.title.isWellFormed() || typeof value.completed !== 'boolean'
      || !Number.isInteger(value.version) || value.version < 1 || value.version > 2147483646) invalid();
  return Object.freeze({ id: value.id, title: value.title, completed: value.completed, version: value.version });
}
export function createTaskApi(baseUrl, fetcher = globalThis.fetch, timeoutMs = 10000, tokenProvider = () => null) {
  const base = new URL(baseUrl);
  if ((base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]', '10.0.2.2'].includes(base.hostname)))
      || base.username || base.password || base.search || base.hash || !/\/api\/v1\/?$/.test(base.pathname)) {
    throw new Error('An explicit HTTPS /api/v1 URL (or local development loopback) is required.');
  }
  const endpoint = base.href.replace(/\/$/, '');
  let bound = false; let sessionToken;
  async function request(path, method = 'GET', body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const writing = method !== 'GET';
    try {
      const token = tokenProvider();
      if (bound && token !== sessionToken) throw new ApiFailure('SESSION_CHANGED');
      bound = true; sessionToken = token;
      if (token !== null && (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token) || token.length !== 64)) throw new ApiFailure('UNAUTHENTICATED');
      const response = await fetcher(endpoint + path, {
        method, headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal, credentials: 'omit', redirect: 'error', cache: 'no-store',
      });
      if (response.status >= 500) throw new ApiFailure(writing ? 'OUTCOME_UNKNOWN' : 'STORAGE_UNAVAILABLE');
      if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) invalid();
      const reader = response.body?.getReader();
      if (!reader) invalid();
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1048576) { await reader.cancel(); invalid(); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
      const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      if (!response.ok) {
        const expected = { 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'VERSION_CONFLICT', 422: 'VALIDATION_FAILED', 429: 'RATE_LIMITED' }[response.status];
        if (!expected || data?.error?.code !== expected) throw new ApiFailure('STORAGE_UNAVAILABLE');
        throw new ApiFailure(expected);
      }
      if (response.status !== (method === 'POST' ? 201 : 200)) invalid();
      return data;
    } catch (error) {
      if (error instanceof ApiFailure && error.code !== 'INVALID_RESPONSE') throw error;
      throw new ApiFailure(writing ? 'OUTCOME_UNKNOWN' : 'INVALID_RESPONSE');
    } finally { clearTimeout(timer); }
  }
  return Object.freeze({
    async list() {
      const items = []; const seen = new Set(); let after = null;
      for (let page = 0; page < 100; page++) {
        const result = await request('/tasks?limit=100' + (after ? '&after=' + after : ''));
        if (!Array.isArray(result?.data) || result.data.length > 100) invalid();
        const rows = result.data.map(decodeTask);
        for (const row of rows) {
          if (seen.has(row.id) || (after && row.id <= after)
              || (items.length && row.id <= items[items.length - 1].id)) invalid();
          seen.add(row.id); items.push(row);
        }
        if (!rows.length) { if (result.next_after !== null) invalid(); return Object.freeze(items); }
        if (result.next_after !== rows[rows.length - 1].id) invalid();
        after = result.next_after;
      }
      throw new ApiFailure('INVALID_RESPONSE');
    },
    async create(title) {
      const response = await request('/tasks', 'POST', { title });
      try { return decodeTask(response.data); } catch { throw new ApiFailure('OUTCOME_UNKNOWN'); }
    },
    async replace(task, completed) {
      if (!uuid(task.id) || !Number.isInteger(task.version) || task.version >= 2147483646) throw new ApiFailure('VALIDATION_FAILED');
      const response = await request('/tasks/' + task.id, 'PUT', { title: task.title, completed, version: task.version });
      try {
        const value = decodeTask(response.data);
        if (value.id !== task.id || value.version !== task.version + 1 || value.completed !== completed || value.title !== task.title) invalid();
        return value;
      } catch { throw new ApiFailure('OUTCOME_UNKNOWN'); }
    },
  });
}
