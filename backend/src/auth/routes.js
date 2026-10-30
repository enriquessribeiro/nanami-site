import { Router } from 'express';
import { HttpError } from '../lib/errors.js';
import { loginSchema } from '../lib/validation.js';
import { loginLimiter } from './limiter.js';
import { requireAuth } from './middleware.js';
import { hashPassword, verifyPassword } from './passwords.js';
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createSession,
  destroySession,
  pruneExpiredSessions,
  readSession,
  setSessionCookie,
} from './sessions.js';

/**
 * Hash descartável usado quando o email não existe. Assim o tempo de resposta
 * fica parecido com o de uma senha errada e não dá para enumerar contas.
 */
let dummyHashPromise;
function getDummyHash() {
  dummyHashPromise ??= hashPassword('dummy-password-for-timing');
  return dummyHashPromise;
}

export function authRoutes(db) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, 'bad_request', 'Informe email e senha.');
    }

    const { email, password } = parsed.data;
    const ip = req.ip ?? 'unknown';

    const limit = loginLimiter.check(ip, email);
    if (limit.exceeded) {
      res.set('Retry-After', String(limit.retryAfterSeconds));
      throw new HttpError(
        429,
        'too_many_attempts',
        'Muitas tentativas. Tente novamente em alguns minutos.',
      );
    }

    const admin = db
      .prepare('SELECT id, email, password_hash, password_version FROM admin_users WHERE email = ?')
      .get(email.toLowerCase());

    // Mesma resposta (e trabalho parecido) para email inexistente e senha errada.
    const hashToCheck = admin?.password_hash ?? (await getDummyHash());
    const valid = await verifyPassword(hashToCheck, password);

    if (!admin || !valid) {
      throw new HttpError(401, 'invalid_credentials', 'Email ou senha inválidos.');
    }

    loginLimiter.reset(ip, email);
    pruneExpiredSessions(db);

    db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(Date.now(), admin.id);

    // Token novo a cada login: nada de reaproveitar sessão anterior (fixation).
    const { token } = createSession(db, admin);
    setSessionCookie(res, token);

    res.json({ email: admin.email });
  });

  router.post('/logout', (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      const session = readSession(db, token);
      if (session) destroySession(db, session.sessionId);
    }
    clearSessionCookie(res);
    res.status(204).end();
  });

  router.get('/me', requireAuth(db), (req, res) => {
    res.json({ email: req.admin.email });
  });

  return router;
}
