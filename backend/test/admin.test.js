import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/index.js';
import { hashPassword } from '../src/auth/passwords.js';
import { SESSION_COOKIE } from '../src/auth/sessions.js';
import { seedDatabase } from '../src/db/seed.js';

const EMAIL = 'admin@nanami.com.br';
const PASSWORD = 'senha-de-teste-12345';

let db;
let server;
let baseUrl;
let cookie;

async function api(path, { method = 'GET', body, authenticated = true } = {}) {
  return fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function productPayload(overrides = {}) {
  return {
    name: 'Produto de teste',
    categoryId: 'pelucias',
    description: 'Descrição do produto de teste.',
    details: ['Detalhe 1'],
    tags: ['novo'],
    colors: ['#FFFFFF', '#000000'],
    priceCents: 5000,
    wholesaleCents: 4000,
    minWholesale: 6,
    featured: false,
    active: true,
    ...overrides,
  };
}

before(async () => {
  db = openDatabase({ filename: ':memory:' });
  seedDatabase(db);

  const passwordHash = await hashPassword(PASSWORD);
  db.prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)').run(
    EMAIL,
    passwordHash,
    Date.now(),
  );

  server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const res = await api('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  cookie = res.headers
    .getSetCookie()
    .find((value) => value.startsWith(SESSION_COOKIE))
    .split(';')[0];
});

after(() => {
  server?.close();
  db?.close();
});

test('rotas do admin exigem sessão', async () => {
  for (const path of ['/admin/products', '/admin/categories', '/admin/settings']) {
    const res = await api(path, { authenticated: false });
    assert.equal(res.status, 401, path);
  }
});

test('lista produtos ativos e inativos com busca', async () => {
  const all = await (await api('/admin/products')).json();
  assert.equal(all.products.length, 18);
  assert.ok('active' in all.products[0]);

  const search = await (await api('/admin/products?q=garrafa')).json();
  assert.equal(search.products.length, 1);
  assert.equal(search.products[0].slug, 'garrafa-termica-creme');

  // "%" digitado não pode virar curinga.
  const wildcard = await (await api('/admin/products?q=%25')).json();
  assert.equal(wildcard.products.length, 0);
});

test('cria produto, gera slug e arredonda preço só em centavos', async () => {
  const res = await api('/admin/products', { method: 'POST', body: productPayload() });
  assert.equal(res.status, 201);

  const { product } = await res.json();
  assert.equal(product.slug, 'produto-de-teste');
  assert.equal(product.priceCents, 5000);
  assert.equal(product.wholesaleCents, 4000);
  assert.equal(product.active, true);
  assert.equal(product.image, null);
});

test('slug duplicado recebe sufixo em vez de quebrar', async () => {
  const res = await api('/admin/products', { method: 'POST', body: productPayload() });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).product.slug, 'produto-de-teste-2');
});

test('validação recusa atacado maior que varejo e devolve o campo', async () => {
  const res = await api('/admin/products', {
    method: 'POST',
    body: productPayload({ priceCents: 1000, wholesaleCents: 2000 }),
  });
  assert.equal(res.status, 400);

  const body = await res.json();
  assert.equal(body.error, 'validation_failed');
  assert.equal(body.issues[0].field, 'wholesaleCents');
});

test('validação recusa categoria inexistente', async () => {
  const res = await api('/admin/products', {
    method: 'POST',
    body: productPayload({ categoryId: 'nao-existe' }),
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'unknown_category');
});

test('atualizar produto não muda o slug se não for pedido', async () => {
  const created = await (
    await api('/admin/products', { method: 'POST', body: productPayload({ name: 'Renomeado' }) })
  ).json();

  const res = await api(`/admin/products/${created.product.id}`, {
    method: 'PUT',
    body: productPayload({ name: 'Outro nome', priceCents: 9900, wholesaleCents: 7900 }),
  });

  assert.equal(res.status, 200);
  const { product } = await res.json();
  assert.equal(product.name, 'Outro nome');
  assert.equal(product.slug, created.product.slug);
  assert.equal(product.priceCents, 9900);
});

test('desativar produto o remove do catálogo público', async () => {
  const { product } = await (
    await api('/admin/products', { method: 'POST', body: productPayload({ name: 'Some da vitrine' }) })
  ).json();

  await api(`/admin/products/${product.id}`, {
    method: 'PUT',
    body: productPayload({ name: 'Some da vitrine', active: false }),
  });

  const publicCatalog = await (await api('/catalog', { authenticated: false })).json();
  assert.equal(
    publicCatalog.products.some((item) => item.slug === product.slug),
    false,
  );
});

test('excluir produto devolve 204 e depois 404', async () => {
  const { product } = await (
    await api('/admin/products', { method: 'POST', body: productPayload({ name: 'Vai sumir' }) })
  ).json();

  const first = await api(`/admin/products/${product.id}`, { method: 'DELETE' });
  assert.equal(first.status, 204);

  const second = await api(`/admin/products/${product.id}`, { method: 'DELETE' });
  assert.equal(second.status, 404);
});

test('id não numérico em produto é 404, não erro de banco', async () => {
  const res = await api('/admin/products/abc');
  assert.equal(res.status, 404);
});

test('categorias: cria, atualiza e recusa excluir com produtos', async () => {
  const created = await api('/admin/categories', {
    method: 'POST',
    body: { name: 'Categoria Nova', emoji: '✨', tone: 'lilas' },
  });
  assert.equal(created.status, 201);

  const { category } = await created.json();
  assert.equal(category.id, 'categoria-nova');
  assert.equal(category.productCount, 0);

  const updated = await api(`/admin/categories/${category.id}`, {
    method: 'PUT',
    body: { name: 'Categoria Renomeada', emoji: '🌟', tone: 'azul' },
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).category.name, 'Categoria Renomeada');

  const inUse = await api('/admin/categories/pelucias', { method: 'DELETE' });
  assert.equal(inUse.status, 409);
  assert.equal((await inUse.json()).error, 'category_in_use');

  const removed = await api(`/admin/categories/${category.id}`, { method: 'DELETE' });
  assert.equal(removed.status, 204);
});

test('categoria com id repetido devolve 409', async () => {
  const res = await api('/admin/categories', {
    method: 'POST',
    body: { id: 'bolsas', name: 'Bolsas 2', emoji: '', tone: 'rosa' },
  });
  assert.equal(res.status, 409);
});

test('configurações: lê, atualiza e valida WhatsApp', async () => {
  const current = await (await api('/admin/settings')).json();
  assert.equal(current.settings.email, 'admin@nanami.com.br');

  const bad = await api('/admin/settings', {
    method: 'PUT',
    body: { ...current.settings, whatsapp: '(11) 99999-9999' },
  });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).issues[0].field, 'whatsapp');

  const ok = await api('/admin/settings', {
    method: 'PUT',
    body: { ...current.settings, name: 'Nanami Teste', whatsappLabel: '(11) 90000-0000' },
  });
  assert.equal(ok.status, 200);

  const saved = await ok.json();
  assert.equal(saved.settings.name, 'Nanami Teste');
  assert.equal(saved.settings.whatsappLabel, '(11) 90000-0000');
});

test('settings não aceita campos fora do contrato', async () => {
  const current = await (await api('/admin/settings')).json();
  const res = await api('/admin/settings', {
    method: 'PUT',
    body: { ...current.settings, id: 99, isAdmin: true },
  });

  assert.equal(res.status, 200);
  const { settings } = await res.json();
  assert.equal(settings.id, undefined);
  assert.equal(settings.isAdmin, undefined);
});
