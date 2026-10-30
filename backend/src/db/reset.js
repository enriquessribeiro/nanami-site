import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

/**
 * Apaga o banco local e sobe um novo com o seed da loja.
 * Uso: `npm run db:reset` (nunca roda em produção).
 */
if (config.env === 'production') {
  console.error('db:reset não roda com NODE_ENV=production.');
  process.exit(1);
}

const { openDatabase } = await import('./index.js');
const { seedDatabase } = await import('./seed.js');

const dbFile = path.join(config.dataDir, 'nanami.db');
for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(dbFile + suffix, { force: true });
}

const db = openDatabase();
seedDatabase(db);
db.close();

console.log(`[db] banco recriado em ${dbFile}`);
