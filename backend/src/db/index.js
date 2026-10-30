import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { config } from '../config.js';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

/**
 * Aplica as migrations em ordem usando `PRAGMA user_version` como contador.
 * Cada arquivo roda dentro de uma transação: ou a migration inteira entra ou
 * nada muda, então um crash no meio do boot não deixa schema pela metade.
 */
function migrate(db) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const current = db.pragma('user_version', { simple: true });

  for (const [index, file] of files.entries()) {
    const version = index + 1;
    if (version <= current) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${version}`);
    })();

    console.log(`[db] migration ${file} aplicada`);
  }
}

export function openDatabase({ filename } = {}) {
  if (filename !== ':memory:') {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }

  const db = new Database(filename ?? path.join(config.dataDir, 'nanami.db'));

  // WAL: leituras não bloqueiam a escrita (o catálogo é lido com frequência).
  db.pragma('journal_mode = WAL');
  // Chaves estrangeiras são por conexão no SQLite e vêm desligadas por padrão.
  db.pragma('foreign_keys = ON');
  // Espera até 5s se outra conexão estiver escrevendo, em vez de falhar na hora.
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  migrate(db);

  return db;
}
