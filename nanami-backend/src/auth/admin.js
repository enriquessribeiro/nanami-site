import crypto from 'node:crypto';
import { config } from '../config.js';
import { checkPasswordPolicy, hashPassword } from './passwords.js';

/**
 * Cria o único usuário admin no primeiro boot.
 *
 * A senha vem de ADMIN_PASSWORD. Se ela não existir, geramos uma senha forte
 * aleatória e imprimimos uma única vez no log — assim o projeto nunca sobe com
 * uma senha padrão do tipo "admin123".
 */
export async function ensureAdminUser(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get();
  if (count > 0) return;

  const email = config.admin.email.trim().toLowerCase();
  let password = config.admin.password;
  let generated = false;

  if (!password) {
    password = crypto.randomBytes(15).toString('base64url'); // 20 caracteres
    generated = true;
  }

  const policy = checkPasswordPolicy(password);
  if (!policy.ok) {
    throw new Error(`ADMIN_PASSWORD inválida: ${policy.message}`);
  }

  const passwordHash = await hashPassword(password);

  db.prepare(
    'INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)',
  ).run(email, passwordHash, Date.now());

  if (generated) {
    console.log(
      [
        '',
        '  ┌─────────────────────────────────────────────────────────',
        '  │ Admin criado com senha gerada (guarde e troque depois):',
        `  │   email: ${email}`,
        `  │   senha: ${password}`,
        '  │ Esta senha não será mostrada novamente.',
        '  └─────────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    );
  } else {
    console.log(`[auth] admin criado para ${email}`);
  }
}
