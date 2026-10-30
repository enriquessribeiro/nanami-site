import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { openDatabase } from '../src/db/index.js';
import { hashPassword } from '../src/auth/passwords.js';
import { SESSION_COOKIE } from '../src/auth/sessions.js';

let db;
let server;
let baseUrl;
let adminId;

const EMAIL = 'admin@nanami.com.br';
const PASSWORD = 'senha-de-teste-12345';

function sessionCookie(response) {
  const header = response.headers.getSetCookie().find((value) => value.startsWith(SESSION_COOKIE));
  return header ? header.split(';')[0] : null;
}

async function login(password = PASSWORD) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password }),
  });
}

before(async () => {
  db = openDatabase({ filename: ':memory:' });

  const passwordHash = await hashPassword(PASSWORD);
  ({ lastInsertRowid: adminId } = db
    .prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)')
    .run(EMAIL, passwordHash, Date.now()));

  server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  db?.close();
});

test('login com senha correta cria sessão com cookie endurecido', async () => {
  const res = await login();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { email: EMAIL });

  const cookie = sessionCookie(res);
  assert.ok(cookie, 'cookie de sessão ausente');

  const raw = res.headers.getSetCookie().join(';');
  assert.match(raw, /HttpOnly/);
  assert.match(raw, /Secure/);
  assert.match(raw, /SameSite=Strict/);
  assert.match(raw, /Path=\//);
  assert.doesNotMatch(raw, /Domain=/);
  assert.match(raw, /Max-Age=43200/);
});

test('senha errada devolve 401 genérico', async () => {
  const res = await login('senha-errada-mas-longa');
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error, 'invalid_credentials');
  assert.equal(body.message, 'Email ou senha inválidos.');
});

test('email inexistente devolve a mesma resposta da senha errada', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nao-existe@nanami.com.br', password: PASSWORD }),
  });
  assert.equal(res.status, 401);
  assert.match((await res.json()).message, /Email ou senha inválidos/);
});

test('/api/auth/me sem cookie devolve 401', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(res.status, 401);
});

test('/api/auth/me com cookie devolve o admin', async () => {
  const cookie = sessionCookie(await login());
  const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { email: EMAIL });
});

test('token inventado não autentica', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: `${SESSION_COOKIE}=token-inventado-de-proposito` },
  });
  assert.equal(res.status, 401);
});

test('logout destrói a sessão no banco', async () => {
  const cookie = sessionCookie(await login());
  const res = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  assert.equal(res.status, 204);

  const after = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(after.status, 401);
});

test('sessão inativa por mais de 12h é recusada', async () => {
  const cookie = sessionCookie(await login());
  const tokenHash = cookie.split('=')[1];
  db.prepare('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?').run(
    Date.now() - 13 * 60 * 60 * 1000,
    crypto.createHash('sha256').update(tokenHash).digest('hex'),
  );

  const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(res.status, 401);
});

test('trocar a senha invalida sessões antigas', async () => {
  const cookie = sessionCookie(await login());
  db.prepare('UPDATE admin_users SET password_version = password_version + 1 WHERE id = ?').run(
    adminId,
  );

  const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(res.status, 401);

  db.prepare('UPDATE admin_users SET password_version = 1 WHERE id = ?').run(adminId);
});

test('Origin diferente do site é recusado em POST', async () => {
  const res = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: 'https://site-malicioso.example' },
  });
  assert.equal(res.status, 403);
});

test('Origin igual ao host é aceito', async () => {
  const res = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: baseUrl },
  });
  assert.equal(res.status, 204);
});

test('rate limit bloqueia depois de 5 tentativas por email', async () => {
  for (let i = 0; i < 5; i += 1) await login('senha-errada-mas-longa');

  const blocked = await login('senha-errada-mas-longa');
  assert.equal(blocked.status, 429);
  assert.match(blocked.headers.get('retry-after'), /^\d+$/);
  assert.equal((await blocked.json()).error, 'too_many_attempts');
});

test('login não vaza se o email existe pela validação', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'x' }),
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'bad_request');
});

test('ensureAdminUser não cria segundo admin e recusa senha curta', async () => {
  const { ensureAdminUser } = await import('../src/auth/admin.js');
  const before = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;

  await ensureAdminUser(db);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count, before);

  // Simula banco vazio + senha fraca configurada.
  db.prepare('DELETE FROM admin_users').run();
  const original = config.admin.password;
  config.admin.password = 'curta';
  await assert.rejects(() => ensureAdminUser(db), /ADMIN_PASSWORD inválida/);
  config.admin.password = original;

  // Restaura o admin padrão dos outros testes.
  const passwordHash = await hashPassword(PASSWORD);
  db.prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)').run(
    EMAIL,
    passwordHash,
    Date.now(),
  );
});
