import { createApp } from './app.js';
import { ensureAdminUser } from './auth/admin.js';
import { config, isProd } from './config.js';
import { openDatabase } from './db/index.js';
import { seedDatabase } from './db/seed.js';

const db = openDatabase();
seedDatabase(db);
await ensureAdminUser(db);

const app = createApp(db);
const server = app.listen(config.port, () => {
  console.log(`[api] ouvindo em http://localhost:${config.port} (${config.env})`);

  // Aviso cedo: sem PUBLIC_ORIGIN, a checagem de Origin usa o Host da
  // requisição — atrás de proxy isso pode recusar o painel inteiro.
  if (isProd && !config.publicOrigin) {
    console.warn(
      '[api] PUBLIC_ORIGIN vazio: a validação de Origin usará o Host da requisição. ' +
        'Defina PUBLIC_ORIGIN=https://SEU-DOMINIO.',
    );
  }
});

/**
 * Desligamento limpo: para de aceitar conexões, espera as em andamento e fecha
 * o SQLite (importante com WAL — garante checkpoint dos dados).
 */
function shutdown(signal) {
  console.log(`[api] ${signal} recebido, encerrando...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });

  // Rede de segurança se alguma conexão travar.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
