import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/index.js';
import { seedDatabase } from '../src/db/seed.js';

let db;
let server;
let baseUrl;

before(async () => {
  db = openDatabase({ filename: ':memory:' });
  seedDatabase(db);

  server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  db?.close();
});

test('GET /api/health responde ok', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /api/catalog devolve loja, categorias e produtos ativos', async () => {
  const res = await fetch(`${baseUrl}/api/catalog`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('cache-control'), /must-revalidate/);

  const body = await res.json();
  assert.equal(body.store.email, 'admin@nanami.com.br');
  assert.equal(body.categories.length, 8);
  assert.equal(body.products.length, 18);

  const product = body.products.find((item) => item.slug === 'garrafa-termica-creme');
  assert.equal(product.priceCents, 5990);
  assert.equal(product.wholesaleCents, 4490);
  assert.equal(product.featured, true);
  assert.deepEqual(product.tags, ['novo', 'mais vendido']);
  assert.equal(product.image, null);
});

test('preços são inteiros em centavos (nada de float)', async () => {
  const { products } = await (await fetch(`${baseUrl}/api/catalog`)).json();
  for (const product of products) {
    assert.ok(Number.isInteger(product.priceCents), `${product.slug} priceCents`);
    assert.ok(Number.isInteger(product.wholesaleCents), `${product.slug} wholesaleCents`);
    assert.ok(product.wholesaleCents <= product.priceCents, `${product.slug} atacado <= varejo`);
  }
});

test('rota desconhecida da API devolve 404 em JSON', async () => {
  const res = await fetch(`${baseUrl}/api/nao-existe`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'not_found' });
});

test('seed é idempotente', () => {
  seedDatabase(db);
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  assert.equal(count, 18);
});

test('produto inativo não aparece no catálogo público', async () => {
  db.prepare("UPDATE products SET active = 0 WHERE slug = 'squeeze-verde'").run();

  const { products } = await (await fetch(`${baseUrl}/api/catalog`)).json();
  assert.equal(products.length, 17);
  assert.equal(
    products.some((item) => item.slug === 'squeeze-verde'),
    false,
  );

  db.prepare("UPDATE products SET active = 1 WHERE slug = 'squeeze-verde'").run();
});
