import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(here, '..');

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

/**
 * Configuração lida uma única vez, no boot. Nada aqui é sobrescrito em runtime,
 * então erros de ambiente aparecem cedo e não no meio de um request.
 *
 * Caminhos absolutos: em produção o SQLite e os uploads ficam em volumes
 * montados fora da árvore do código (ex.: /data e /uploads no Docker).
 */
export const config = {
  env: env('NODE_ENV', 'development'),
  port: Number(env('PORT', 3001)),
  dataDir: path.resolve(rootDir, env('DATA_DIR', 'data')),
  uploadDir: path.resolve(rootDir, env('UPLOAD_DIR', 'uploads')),
  // Limite de corpo em JSON. O catálogo público é só leitura; o admin envia
  // payloads pequenos, então 100kb é folgado e limita abuso trivial.
  jsonLimit: env('JSON_LIMIT', '100kb'),
  // Origem pública do site (ex.: https://nanami.com.br). Usada para validar o
  // header Origin em requisições que mudam estado. Sem barra no final.
  publicOrigin: env('PUBLIC_ORIGIN', '').replace(/\/+$/, ''),
  // Confiar em X-Forwarded-* do proxy (Caddy/Nginx). Desligado por padrão.
  trustProxy: env('TRUST_PROXY', '') === '1',
  // Pasta com o build do Vite. Vazia em dev (o Vite serve o frontend).
  staticDir: env('STATIC_DIR', ''),
  // Teto de requisições por IP na API (janela de 5 min). Generoso de propósito:
  // o que precisa de aperto é o login, não o catálogo.
  apiRateLimitMax: Number(env('API_RATE_LIMIT_MAX', 600)),
  admin: {
    email: env('ADMIN_EMAIL', 'admin@nanami.com.br'),
    // Sem ADMIN_PASSWORD no primeiro boot, uma senha aleatória é gerada e
    // impressa uma única vez no log.
    password: env('ADMIN_PASSWORD', ''),
  },
};

export const isProd = config.env === 'production';
