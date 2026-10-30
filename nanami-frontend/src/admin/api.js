/**
 * Cliente da API do painel.
 *
 * Sempre mesma origem (proxy em dev, Express em produção), então o cookie
 * `__Host-` viaja com `credentials: 'same-origin'` e não existe CORS.
 */
export class ApiError extends Error {
  constructor(status, payload) {
    super(payload?.message ?? 'Algo deu errado.');
    this.status = status;
    this.code = payload?.error ?? 'unknown';
    this.issues = payload?.issues ?? [];
  }
}

let onUnauthorized = () => {};

/** O AdminApp registra aqui o que fazer quando a sessão morre (voltar ao login). */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function api(path, { method = 'GET', body } = {}) {
  const isFormData = body instanceof FormData;

  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    // FormData precisa que o browser monte o Content-Type (boundary incluso).
    headers: body && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // 401 em rota protegida = sessão expirada. Em /auth/login é só senha errada.
    if (response.status === 401 && !path.startsWith('/auth/login')) {
      onUnauthorized();
    }
    throw new ApiError(response.status, payload);
  }

  return payload;
}
