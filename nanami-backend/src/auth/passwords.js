import { hash, verify, Algorithm } from '@node-rs/argon2';

/**
 * Argon2id com os parâmetros recomendados pela OWASP (19 MiB, t=2, p=1).
 * O hash resultante já carrega os parâmetros, então subir o custo no futuro
 * não invalida senhas antigas.
 */
const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(password) {
  return hash(password, OPTIONS);
}

export function verifyPassword(passwordHash, password) {
  return verify(passwordHash, password, OPTIONS);
}

/**
 * Política mínima. Comprimento é o fator que mais importa de verdade; não
 * exigimos símbolos nem bloqueamos caracteres (isso só piora a senha).
 */
export function checkPasswordPolicy(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  if (password.length > 200) {
    return { ok: false, message: 'A senha é longa demais (máximo 200 caracteres).' };
  }
  return { ok: true };
}
