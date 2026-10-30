import express from 'express';
import path from 'node:path';

/**
 * Servir o build do Vite (loja + painel) no mesmo processo da API.
 *
 * Em produção tudo é uma origem só: o cookie `__Host-` funciona, não existe
 * CORS e o CSP pode ser bem restritivo. Em dev isso não é usado — o Vite faz o
 * proxy de /api e cuida do HMR.
 */
export function mountStatic(app, staticDir) {
  const indexFile = path.join(staticDir, 'index.html');

  // CSP: só scripts do próprio site (o Vite builda sem inline), estilos com
  // 'unsafe-inline' porque o React usa style="" para gradientes dinâmicos, e
  // fontes do Google (mantidas hospedadas lá de propósito).
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  app.use((req, res, next) => {
    res.set('Content-Security-Policy', csp);
    next();
  });

  // Assets com hash no nome podem ser cacheados para sempre.
  app.use(
    '/assets',
    express.static(path.join(staticDir, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }),
  );
  // Asset que não existe é 404 de verdade, não o index.html.
  app.use('/assets', (req, res) => res.status(404).type('text').send('Not found'));

  app.use(
    express.static(staticDir, {
      index: false,
      // Cache-Control é definido por nós em setHeaders; o serve-static não
      // deve sobrescrever.
      cacheControl: false,
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          // HTML nunca em cache: um deploy novo precisa aparecer na hora.
          res.set('Cache-Control', 'no-cache');
        } else {
          res.set('Cache-Control', 'public, max-age=3600');
        }
      },
    }),
  );

  // A loja usa hash routing (#/catalogo), então o servidor só precisa devolver
  // o index para qualquer caminho que não seja um arquivo.
  app.get('/admin', (req, res) => res.redirect(302, '/admin.html'));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api/')) return next();
    res.set('Cache-Control', 'no-cache');
    return res.sendFile(indexFile);
  });

  app.use((req, res) => res.status(404).type('text').send('Not found'));
}
