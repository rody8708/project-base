// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Synthetic browser acceptance page, not a shipped application. Secrets stay in
// this disposable fixture and are never printed to the operator's terminal.
export async function browserCorsFixture(apiUrl, token) {
  const source = await readFile(new URL('../../starters/web/src/adapters/task-api.js', import.meta.url));
  const servers = [];
  const urls = [];
  try {
    for (const allowed of [true, false]) {
      let origin;
      const server = createServer((request, response) => {
        if (request.headers.host !== new URL(origin).host || request.method !== 'GET') { response.writeHead(403).end(); return; }
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        if (request.url === '/task-api.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(source); return; }
        if (request.url !== '/') { response.writeHead(404).end(); return; }
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Native PHP CORS acceptance</title>
<h1>${allowed ? 'Allowed' : 'Blocked'} origin test</h1><button id="run">Run browser check</button><p role="status">Not executed</p>
<script type="module">
import { createTaskApi } from '/task-api.js';
const url = ${JSON.stringify(apiUrl)}, token = ${JSON.stringify(token)};
document.querySelector('button').onclick = async () => {
  document.querySelector('button').disabled = true;
  const status = document.querySelector('[role=status]');
  try {
    const api = createTaskApi(url, undefined, undefined, () => token);
    await api.list();
    if (!${allowed}) throw new Error('Unexpected access');
    const created = await api.create('Synthetic browser task');
    const updated = await api.replace(created, true);
    if (!(await api.list()).some(row => row.id === updated.id && row.completed)) throw new Error('Readback failed');
    const deleted = await fetch(url + '/tasks/' + updated.id, {method:'DELETE', credentials:'omit', headers:{Authorization:'Bearer ' + token,'Content-Type':'application/json'},body:JSON.stringify({version:updated.version})});
    if (deleted.status !== 204 || (await api.list()).some(row => row.id === updated.id)) throw new Error('Cleanup failed');
    status.textContent = 'PASS: authenticated browser CRUD and cleanup';
  } catch (error) {
    status.textContent = !${allowed} && error.code === 'INVALID_RESPONSE' ? 'PASS: browser blocked unauthorized origin' : 'FAIL: browser acceptance';
  }
};
</script></html>`);
      });
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
      servers.push(server);
      origin = `http://127.0.0.1:${server.address().port}`;
      urls.push(origin);
    }
    return { allowed: urls[0], blocked: urls[1], close: async () => {
      await Promise.all(servers.map(server => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); })));
    } };
  } catch (error) {
    for (const server of servers) { server.close(); server.closeAllConnections(); }
    throw error;
  }
}
