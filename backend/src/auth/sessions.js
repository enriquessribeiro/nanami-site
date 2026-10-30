import crypto from 'node:crypto';

/**
 * Sessão de admin.
 *
 * - Token aleatório de 256 bits, entregue só no cookie.
 * - O banco guarda apenas o SHA-256 do token: quem ler o arquivo do SQLite não
 *   consegue montar um cookie válido.
 * - `__Host-` força, no navegador, Secure + Path=/ + ausência de Domain, o que
 *   impede um subdomínio comprometido de sobrescrever o cookie.
 * - SameSite=Strict: o cookie não acompanha navegação vinda de outro site,
 *   o que já barra a maior parte de CSRF.
 */
export const SESSION_COOKIE = '__Host-nanami_session';

export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000; // 12 h sem uso → expira
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias no total
const TOKEN_BYTES = 32;

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    // Sempre Secure: em produção é obrigatório (HTTPS) e localhost é tratado
    // como contexto seguro pelos navegadores. Não use a API por IP na LAN.
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function setSessionCookie(res, token, maxAgeMs = SESSION_IDLE_MS) {
  res.cookie(SESSION_COOKIE, token, cookieOptions(maxAgeMs));
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
}

export function createSession(db, admin) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
  const now = Date.now();

  db.prepare(
    `INSERT INTO sessions (token_hash, admin_id, password_version, created_at, last_seen_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    hashToken(token),
    admin.id,
    admin.password_version,
    now,
    now,
    now + SESSION_ABSOLUTE_MS,
  );

  return { token, expiresAt: now + SESSION_ABSOLUTE_MS };
}

/**
 * Valida o token e devolve o admin. Aplica as duas janelas:
 * expiração absoluta (7 dias) e inatividade (12 h sem uso).
 */
export function readSession(db, token) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return null;

  const now = Date.now();
  const row = db
    .prepare(
      `SELECT s.id AS session_id, s.password_version AS session_version,
              s.last_seen_at, s.expires_at,
              a.id, a.email, a.password_version
         FROM sessions s
         JOIN admin_users a ON a.id = s.admin_id
        WHERE s.token_hash = ?`,
    )
    .get(hashToken(token));

  if (!row) return null;
  // Troca de senha invalida sessões criadas com o hash anterior.
  if (row.session_version !== row.password_version) return null;
  if (row.expires_at <= now) return null;
  if (now - row.last_seen_at > SESSION_IDLE_MS) return null;

  return {
    sessionId: row.session_id,
    expiresAt: row.expires_at,
    admin: { id: row.id, email: row.email },
  };
}

export function touchSession(db, sessionId) {
  db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').run(Date.now(), sessionId);
}

export function destroySession(db, sessionId) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

/** Limpeza best-effort das sessões vencidas (roda no boot e a cada login). */
export function pruneExpiredSessions(db) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR last_seen_at <= ?').run(
    Date.now(),
    Date.now() - SESSION_IDLE_MS,
  );
}
