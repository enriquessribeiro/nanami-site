import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
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
let uploadDir;
let productId;

async function api(path, options = {}) {
  return fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
}

function formWith(buffer, type, filename) {
  const form = new FormData();
  form.append('image', new Blob([buffer], { type }), filename);
  return form;
}

before(async () => {
  uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nanami-uploads-'));
  config.uploadDir = uploadDir;

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

  const login = await api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  cookie = login.headers
    .getSetCookie()
    .find((value) => value.startsWith(SESSION_COOKIE))
    .split(';')[0];

  const { products } = await (await api('/admin/products')).json();
  productId = products[0].id;
});

after(async () => {
  server?.close();
  db?.close();
  await fs.rm(uploadDir, { recursive: true, force: true });
});

test('upload exige sessão', async () => {
  const saved = cookie;
  cookie = null;
  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(await sharp({ create: { width: 10, height: 10, channels: 3, background: '#fff' } }).png().toBuffer(), 'image/png', 'a.png'),
  });
  cookie = saved;
  assert.equal(res.status, 401);
});

test('PNG válido vira WebP com nome UUID e aparece no produto', async () => {
  const png = await sharp({
    create: { width: 40, height: 40, channels: 3, background: '#f5a3b5' },
  })
    .png()
    .toBuffer();

  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(png, 'image/png', 'produto.png'),
  });

  assert.equal(res.status, 201);
  const { product } = await res.json();
  assert.match(product.image, /^[0-9a-f-]{36}\.webp$/);

  const file = path.join(uploadDir, product.image);
  const buffer = await fs.readFile(file);
  // WebP: "RIFF" .... "WEBP"
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');

  const meta = await sharp(buffer).metadata();
  assert.equal(meta.format, 'webp');
  // EXIF/GPS não sobrevivem à recodificação.
  assert.equal(meta.exif, undefined);
});

test('reduz imagens maiores que 1600px sem estourar', async () => {
  const big = await sharp({
    create: { width: 2400, height: 1200, channels: 3, background: '#fff' },
  })
    .jpeg()
    .toBuffer();

  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(big, 'image/jpeg', 'grande.jpg'),
  });

  assert.equal(res.status, 201);
  const { product } = await res.json();
  const meta = await sharp(path.join(uploadDir, product.image)).metadata();
  assert.equal(meta.width, 1600);
  assert.equal(meta.height, 800);
});

test('SVG é recusado mesmo com mimetype de imagem', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(svg, 'image/svg+xml', 'x.svg'),
  });
  assert.equal(res.status, 415);
});

test('arquivo com mimetype de imagem mas conteúdo falso é recusado', async () => {
  const fake = Buffer.from('isto não é uma imagem, só um texto qualquer');
  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(fake, 'image/png', 'falsa.png'),
  });
  assert.equal(res.status, 415);
});

test('imagem acima de 5 MB devolve 413', async () => {
  const huge = Buffer.alloc(6 * 1024 * 1024, 1);
  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(huge, 'image/png', 'grande.png'),
  });
  assert.equal(res.status, 413);
});

test('GET /api/media serve o arquivo com cabeçalhos seguros', async () => {
  const { product } = await (await api(`/admin/products/${productId}`)).json();

  const res = await fetch(`${baseUrl}/api/media/${product.image}`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/webp');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('cache-control'), /immutable/);
});

test('GET /api/media recusa nome fora do padrão e não vaza disco', async () => {
  for (const name of ['..%2f..%2fpackage.json', 'abc.webp', 'malicioso.php']) {
    const res = await fetch(`${baseUrl}/api/media/${name}`);
    assert.equal(res.status, 404, name);
  }
});

test('trocar imagem apaga o arquivo anterior', async () => {
  const before = (await (await api(`/admin/products/${productId}`)).json()).product.image;

  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: '#000' },
  })
    .png()
    .toBuffer();

  const res = await api(`/admin/products/${productId}/image`, {
    method: 'POST',
    body: formWith(png, 'image/png', 'nova.png'),
  });
  const { product } = await res.json();

  assert.notEqual(product.image, before);
  await assert.rejects(() => fs.stat(path.join(uploadDir, before)));
  await fs.stat(path.join(uploadDir, product.image));
});

test('remover imagem desvincula do produto e apaga o arquivo', async () => {
  const { product } = await (await api(`/admin/products/${productId}`)).json();

  const res = await api(`/admin/products/${productId}/image`, { method: 'DELETE' });
  assert.equal(res.status, 200);

  const updated = (await res.json()).product;
  assert.equal(updated.image, null);
  await assert.rejects(() => fs.stat(path.join(uploadDir, product.image)));
});

test('excluir produto apaga a imagem do disco', async () => {
  const png = await sharp({
    create: { width: 16, height: 16, channels: 3, background: '#123456' },
  })
    .png()
    .toBuffer();

  const created = await (
    await api('/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Produto com foto',
        categoryId: 'pelucias',
        priceCents: 1000,
        wholesaleCents: 800,
        colors: ['#FFFFFF', '#000000'],
      }),
    })
  ).json();

  const uploaded = await (
    await api(`/admin/products/${created.product.id}/image`, {
      method: 'POST',
      body: formWith(png, 'image/png', 'foto.png'),
    })
  ).json();

  const file = path.join(uploadDir, uploaded.product.image);
  await fs.stat(file);

  await api(`/admin/products/${created.product.id}`, { method: 'DELETE' });

  await assert.rejects(() => fs.stat(file));
});
