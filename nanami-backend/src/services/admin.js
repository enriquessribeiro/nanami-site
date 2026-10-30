/**
 * Consultas e escrita do painel admin.
 *
 * Regras que valem para tudo aqui:
 * - SQL sempre parametrizado (better-sqlite3 não aceita string interpolada).
 * - Dinheiro em centavos inteiros.
 * - Erros de constraint do SQLite viram 409 com mensagem de negócio, em vez de
 *   stack trace na cara do admin.
 */
import { HttpError } from '../lib/errors.js';

const ISO = (value) => (value ? `${value.replace(' ', 'T')}Z` : null);

function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function toAdminProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    description: row.description,
    details: parseJson(row.details_json),
    tags: parseJson(row.tags_json),
    colors: parseJson(row.colors_json),
    priceCents: row.price_cents,
    wholesaleCents: row.wholesale_cents,
    minWholesale: row.min_wholesale,
    image: row.image,
    featured: row.featured === 1,
    active: row.active === 1,
    position: row.position,
    createdAt: ISO(row.created_at),
    updatedAt: ISO(row.updated_at),
  };
}

function toAdminCategory(row, productCount = 0) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    tone: row.tone,
    position: row.position,
    productCount,
  };
}

/** "Laço duplo de cetim rosa" → "laco-duplo-de-cetim-rosa" */
export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function uniqueSlug(db, desired, ignoreId = null) {
  const base = slugify(desired) || 'produto';
  const exists = db.prepare('SELECT id FROM products WHERE slug = ? AND id IS NOT ?');

  let candidate = base;
  let suffix = 2;
  while (exists.get(candidate, ignoreId)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/* -------------------------------------------------------------------------- */
/* Produtos                                                                    */
/* -------------------------------------------------------------------------- */

export function listProducts(db, { q = '', category = '', status = 'all' } = {}) {
  const where = [];
  const params = {};

  if (q.trim()) {
    // ESCAPE evita que "%" e "_" digitados virem curinga.
    where.push("(p.name LIKE @q ESCAPE '\\' OR p.slug LIKE @q ESCAPE '\\')");
    params.q = `%${q.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  }
  if (category) {
    where.push('p.category_id = @category');
    params.category = category;
  }
  if (status === 'active') where.push('p.active = 1');
  if (status === 'inactive') where.push('p.active = 0');

  const sql = `SELECT p.* FROM products p
               ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY p.position, p.name`;

  return db.prepare(sql).all(params).map(toAdminProduct);
}

export function getProduct(db, id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'not_found', 'Produto não encontrado.');
  return toAdminProduct(row);
}

function assertCategoryExists(db, categoryId) {
  const found = db.prepare('SELECT 1 AS ok FROM categories WHERE id = ?').get(categoryId);
  if (!found) throw new HttpError(400, 'unknown_category', 'Categoria inexistente.');
}

function productParams(input, slug) {
  return {
    slug,
    name: input.name,
    categoryId: input.categoryId,
    description: input.description,
    details: JSON.stringify(input.details),
    tags: JSON.stringify(input.tags),
    colors: JSON.stringify(input.colors),
    priceCents: input.priceCents,
    wholesaleCents: input.wholesaleCents,
    minWholesale: input.minWholesale,
    featured: input.featured ? 1 : 0,
    active: input.active ? 1 : 0,
  };
}

export function createProduct(db, input) {
  assertCategoryExists(db, input.categoryId);

  const slug = uniqueSlug(db, input.slug || input.name);
  const { position } = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM products')
    .get();

  const info = db
    .prepare(
      `INSERT INTO products (
         slug, name, category_id, description, details_json, tags_json, colors_json,
         price_cents, wholesale_cents, min_wholesale, featured, active, position
       ) VALUES (
         @slug, @name, @categoryId, @description, @details, @tags, @colors,
         @priceCents, @wholesaleCents, @minWholesale, @featured, @active, @position
       )`,
    )
    .run({ ...productParams(input, slug), position });

  return getProduct(db, info.lastInsertRowid);
}

export function updateProduct(db, id, input) {
  const current = getProduct(db, id);
  assertCategoryExists(db, input.categoryId);

  // Slug só muda se o admin pedir explicitamente; renomear o produto não
  // quebra links existentes por acidente.
  const slug =
    input.slug && input.slug !== current.slug
      ? uniqueSlug(db, input.slug, id)
      : current.slug;

  db.prepare(
    `UPDATE products SET
       slug = @slug, name = @name, category_id = @categoryId, description = @description,
       details_json = @details, tags_json = @tags, colors_json = @colors,
       price_cents = @priceCents, wholesale_cents = @wholesaleCents,
       min_wholesale = @minWholesale, featured = @featured, active = @active,
       updated_at = datetime('now')
     WHERE id = @id`,
  ).run({ ...productParams(input, slug), id });

  return getProduct(db, id);
}

export function deleteProduct(db, id) {
  const row = db.prepare('SELECT image FROM products WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'not_found', 'Produto não encontrado.');

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return { image: row.image };
}

/** Guarda só o nome do arquivo; o diretório vem da config e fica fora do webroot. */
export function setProductImage(db, id, filename) {
  const info = db
    .prepare("UPDATE products SET image = ?, updated_at = datetime('now') WHERE id = ?")
    .run(filename, id);

  if (info.changes === 0) throw new HttpError(404, 'not_found', 'Produto não encontrado.');
  return getProduct(db, id);
}

export function clearProductImage(db, id) {
  return setProductImage(db, id, null);
}

/* -------------------------------------------------------------------------- */
/* Categorias                                                                  */
/* -------------------------------------------------------------------------- */

export function listCategories(db) {
  const rows = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
         FROM categories c
        ORDER BY c.position, c.name`,
    )
    .all();

  return rows.map((row) => toAdminCategory(row, row.product_count));
}

export function createCategory(db, input) {
  const id = input.id || slugify(input.name);
  if (!id) throw new HttpError(400, 'invalid_id', 'Não foi possível gerar um identificador.');

  const taken = db.prepare('SELECT 1 AS ok FROM categories WHERE id = ?').get(id);
  if (taken) throw new HttpError(409, 'slug_taken', 'Já existe uma categoria com esse identificador.');

  const { position } = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM categories')
    .get();

  db.prepare(
    'INSERT INTO categories (id, name, emoji, tone, position) VALUES (?, ?, ?, ?, ?)',
  ).run(id, input.name, input.emoji, input.tone, position);

  return listCategories(db).find((category) => category.id === id);
}

export function updateCategory(db, id, input) {
  // O identificador é a chave estrangeira dos produtos: não muda por aqui.
  const info = db
    .prepare('UPDATE categories SET name = ?, emoji = ?, tone = ? WHERE id = ?')
    .run(input.name, input.emoji, input.tone, id);

  if (info.changes === 0) throw new HttpError(404, 'not_found', 'Categoria não encontrada.');
  return listCategories(db).find((category) => category.id === id);
}

export function deleteCategory(db, id) {
  const { count } = db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?')
    .get(id);

  if (count > 0) {
    throw new HttpError(
      409,
      'category_in_use',
      `Esta categoria tem ${count} ${count === 1 ? 'produto' : 'produtos'}. Mova-os antes de excluir.`,
    );
  }

  const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  if (info.changes === 0) throw new HttpError(404, 'not_found', 'Categoria não encontrada.');
}

/* -------------------------------------------------------------------------- */
/* Configurações da loja                                                       */
/* -------------------------------------------------------------------------- */

export function readSettings(db) {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!row) throw new HttpError(500, 'missing_settings', 'Configurações da loja ausentes.');

  return {
    name: row.store_name,
    tagline: row.tagline,
    whatsapp: row.whatsapp,
    whatsappLabel: row.whatsapp_label,
    instagram: row.instagram,
    instagramUrl: row.instagram_url,
    email: row.email,
    address: row.address,
    city: row.city,
    hours: parseJson(row.hours_json),
    payments: parseJson(row.payments_json),
    wholesaleMin: row.wholesale_min,
    freeShippingNote: row.free_shipping_note,
    updatedAt: ISO(row.updated_at),
  };
}

export function updateSettings(db, input) {
  db.prepare(
    `UPDATE settings SET
       store_name = @name, tagline = @tagline, whatsapp = @whatsapp,
       whatsapp_label = @whatsappLabel, instagram = @instagram, instagram_url = @instagramUrl,
       email = @email, address = @address, city = @city, hours_json = @hours,
       payments_json = @payments, wholesale_min = @wholesaleMin,
       free_shipping_note = @freeShippingNote, updated_at = datetime('now')
     WHERE id = 1`,
  ).run({
    ...input,
    hours: JSON.stringify(input.hours),
    payments: JSON.stringify(input.payments),
  });

  return readSettings(db);
}
