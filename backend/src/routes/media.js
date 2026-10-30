import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { mediaFilePath } from '../services/uploads.js';

/**
 * Servir imagem enviada pelo admin.
 *
 * O nome do arquivo é um UUID gerado por nós e validado por regex antes de
 * qualquer acesso a disco — não existe caminho vindo do cliente, logo não há
 * como pedir `../../etc/passwd`. A resposta leva `nosniff` e uma CSP que
 * impede o arquivo de ser interpretado como qualquer outra coisa.
 */
export function mediaRoutes() {
  const router = Router();

  router.get('/:file', (req, res, next) => {
    const absolute = mediaFilePath(req.params.file);
    if (!absolute) return next(new HttpError(404, 'not_found', 'Imagem não encontrada.'));

    res.set('Content-Type', 'image/webp');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Security-Policy', "default-src 'none'; sandbox");
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    // Nome aleatório e conteúdo imutável: pode cachear para sempre.
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    return res.sendFile(absolute, (error) => {
      if (!error || res.headersSent) return;

      // sendFile falhou (arquivo ausente): desfaz os cabeçalhos de imagem para
      // o handler de erro responder JSON de verdade, em vez de um 404 rotulado
      // como image/webp cacheável.
      for (const header of ['Content-Type', 'Cache-Control', 'Content-Security-Policy']) {
        res.removeHeader(header);
      }
      next(new HttpError(404, 'not_found', 'Imagem não encontrada.'));
    });
  });

  return router;
}
