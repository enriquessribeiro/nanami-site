/**
 * Rate limit geral da API (por IP, janela fixa).
 *
 * É uma proteção grosseira contra varredura/abuso: o login tem limites bem
 * mais apertados (5 por IP+email). Estado em memória, como o do login — some no
 * restart e não é compartilhado entre instâncias, o que basta para uma loja
 * rodando em um único container.
 */
export function apiRateLimit({ windowMs = 5 * 60 * 1000, max = 600 } = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const counters = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const current = counters.get(key);

    if (!current || current.resetAt <= now) {
      counters.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      current.count += 1;
      if (current.count > max) {
        res.set('Retry-After', String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))));
        return res.status(429).json({ error: 'too_many_requests' });
      }
    }

    // Limpeza preguiçosa: a cada ~200 requisições, joga fora o que venceu.
    if (counters.size > 5000) {
      for (const [counterKey, value] of counters) {
        if (value.resetAt <= now) counters.delete(counterKey);
      }
    }

    return next();
  };
}
