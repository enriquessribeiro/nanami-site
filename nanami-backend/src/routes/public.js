import { Router } from 'express';
import { readCatalog } from '../services/catalog.js';

/**
 * Rotas públicas (sem autenticação, somente leitura).
 *
 * O front carrega o catálogo inteiro em uma chamada e filtra/ordena em memória
 * — é um catálogo pequeno e isso evita ida ao servidor a cada filtro.
 */
export function publicRoutes(db) {
  const router = Router();

  router.get('/health', (req, res) => {
    const ok = db.prepare('SELECT 1 AS ok').get()?.ok === 1;
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded' });
  });

  router.get('/catalog', (req, res) => {
    // ETag + must-revalidate: o navegador pode guardar, mas sempre confirma
    // antes de usar. Evita servir preço antigo depois de uma edição no admin.
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    res.json(readCatalog(db));
  });

  return router;
}
