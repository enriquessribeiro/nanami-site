import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { openDatabase } from '../src/db/index.js';
import { seedDatabase } from '../src/db/seed.js';

let db;
let server;
let baseUrl;
const originalMax = config.apiRateLimitMax;

before(async () => {
  // Limite baixinho só para este teste.
  config.apiRateLimitMax = 3;

  db = openDatabase({ filename: ':memory:' });
  seedDatabase(db);

  server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  config.apiRateLimitMax = originalMax;
  server?.close();
  db?.close();
});

test('health nunca é barrado pelo rate limit', async () => {
  for (let i = 0; i < 6; i += 1) {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
  }
});

test('respostas de autenticação não são cacheadas', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('acima do limite a API responde 429 com Retry-After', async () => {
  await fetch(`${baseUrl}/api/catalog`);
  await fetch(`${baseUrl}/api/catalog`);
  await fetch(`${baseUrl}/api/catalog`);

  const blocked = await fetch(`${baseUrl}/api/catalog`);
  assert.equal(blocked.status, 429);
  assert.match(blocked.headers.get('retry-after'), /^\d+$/);
  assert.deepEqual(await blocked.json(), { error: 'too_many_requests' });
});

