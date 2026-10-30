import express from 'express';
import { parseCookie } from 'cookie';
import { authRoutes } from './auth/routes.js';
import { verifyOrigin } from './auth/middleware.js';
import { config, isProd } from './config.js';
import { HttpError } from './lib/errors.js';
import { adminRoutes } from './routes/admin.js';
import { mediaRoutes } from './routes/media.js';
import { publicRoutes } from './routes/public.js';
import { mountStatic } from './static.js';
import { apiRateLimit } from './lib/rateLimit.js';

/** Respostas de sessão/admin nunca devem ficar em cache (nem no CDN nem no browser). */
function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}

export function createApp(db) {
  const app = express();

  // Não anuncia o framework: menos informação de graça para quem procura alvo.
  app.disable('x-powered-by');

  // Atrás de Caddy/Nginx o IP real vem em X-Forwarded-For. Só confiamos nisso
  // quando TRUST_PROXY=1, senão qualquer cliente poderia forjar o próprio IP e
  // furar o rate limit.
  if (config.trustProxy) app.set('trust proxy', 1);

  // Corpo só em JSON e com tamanho limitado. Nada de urlencoded/multipart aqui;
  // uploads terão parser próprio (Fase 5).
  app.use(express.json({ limit: config.jsonLimit }));

  // Cabeçalhos de segurança básicos. A CSP entra na Fase 8, quando o app roda
  // atrás do proxy e serve o build do Vite.
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-Frame-Options', 'DENY');
    next();
  });

  // Cookies são lidos manualmente (pacote `cookie`, o mesmo usado pelo res.cookie).
  app.use((req, res, next) => {
    req.cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
    next();
  });

  app.use('/api', verifyOrigin);

  // Limite geral da API (o login tem limites próprios, mais apertados).
  // /api/health fica de fora para o healthcheck do container nunca ser barrado.
  const limiter = apiRateLimit({ windowMs: 5 * 60 * 1000, max: config.apiRateLimitMax });
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    return limiter(req, res, next);
  });

  app.use('/api/auth', noStore, authRoutes(db));
  app.use('/api/admin', noStore, adminRoutes(db));
  app.use('/api/media', mediaRoutes());
  app.use('/api', publicRoutes(db));

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // Em produção (Docker) o mesmo processo serve o build do Vite.
  if (config.staticDir) {
    mountStatic(app, config.staticDir);
  }

  // Handler final: mensagem interna nunca vai para o cliente em produção.
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof HttpError) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
        ...(error.issues ? { issues: error.issues } : {}),
      });
    }

    // JSON malformado cai aqui (SyntaxError do body-parser).
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ error: 'bad_request' });
    }

    // Payload acima do limite.
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'payload_too_large' });
    }

    console.error('[api] erro não tratado:', isProd ? error.message : error);
    return res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
