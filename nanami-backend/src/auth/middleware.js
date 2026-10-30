import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';
import {
  SESSION_COOKIE,
  SESSION_IDLE_MS,
  readSession,
  setSessionCookie,
  touchSession,
} from './sessions.js';

/**
 * Defesa de CSRF em duas camadas:
 * 1. SameSite=Strict no cookie (vem de fábrica).
 * 2. Aqui, todo método que muda estado precisa de `Origin` igual à origem do
 *    site. Requisições sem Origin (curl, testes, server-to-server) passam,
 *    porque não carregam cookie de navegador — o risco real é o browser.
 */
export function verifyOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const origin = req.get('origin');
  if (!origin) return next();

  const expected = config.publicOrigin || `${req.protocol}://${req.get('host')}`;
  if (origin !== expected) {
    return next(new HttpError(403, 'forbidden', 'Origem não permitida.'));
  }
  return next();
}

export function requireAuth(db) {
  return (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return next(new HttpError(401, 'unauthorized', 'Faça login para continuar.'));

    const session = readSession(db, token);
    if (!session) {
      // Token inválido/vencido: limpa o cookie para o navegador parar de enviar.
      res.clearCookie(SESSION_COOKIE, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
      return next(new HttpError(401, 'unauthorized', 'Sessão expirada. Faça login de novo.'));
    }

    // Janela deslizante: cada uso renova o cookie por mais 12 h, mas nunca
    // além da validade absoluta de 7 dias gravada no banco.
    touchSession(db, session.sessionId);
    const remaining = session.expiresAt - Date.now();
    setSessionCookie(res, token, Math.min(SESSION_IDLE_MS, Math.max(remaining, 1000)));

    req.admin = session.admin;
    req.sessionId = session.sessionId;
    return next();
  };
}
