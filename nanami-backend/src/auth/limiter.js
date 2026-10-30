/**
 * Limitador de tentativas de login em memória.
 *
 * Duas janelas independentes: por IP+email (protege a conta) e por IP (protege
 * contra varredura de muitos emails). É estado local do processo: reiniciar
 * zera, e com mais de uma instância cada uma teria seu próprio contador. Para
 * este projeto (uma instância, um admin) isso é suficiente e não exige Redis.
 */
export function createRateLimiter({ windowMs, maxByKey, maxByIp }) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const counters = new Map();

  function hit(key, limit, now) {
    const current = counters.get(key);
    if (!current || current.resetAt <= now) {
      counters.set(key, { count: 1, resetAt: now + windowMs });
      return { exceeded: false, retryAfterMs: 0 };
    }

    current.count += 1;
    if (current.count > limit) {
      return { exceeded: true, retryAfterMs: current.resetAt - now };
    }
    return { exceeded: false, retryAfterMs: 0 };
  }

  return {
    check(ip, email) {
      const now = Date.now();
      const byIp = hit(`ip:${ip}`, maxByIp, now);
      const byKey = hit(`key:${ip}|${email.toLowerCase()}`, maxByKey, now);

      const exceeded = byIp.exceeded || byKey.exceeded;
      return {
        exceeded,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((exceeded ? Math.max(byIp.retryAfterMs, byKey.retryAfterMs) : 0) / 1000),
        ),
      };
    },

    reset(ip, email) {
      counters.delete(`key:${ip}|${email.toLowerCase()}`);
    },

    /** Remove contadores vencidos; chamado periodicamente para não crescer sem fim. */
    sweep() {
      const now = Date.now();
      for (const [key, value] of counters) {
        if (value.resetAt <= now) counters.delete(key);
      }
    },

    get size() {
      return counters.size;
    },
  };
}

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxByKey: 5,
  maxByIp: 20,
});

// Sweep preguiçoso: um timer por processo, sem segurar o event loop.
setInterval(() => loginLimiter.sweep(), 5 * 60 * 1000).unref();
