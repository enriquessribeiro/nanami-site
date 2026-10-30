import { seedCategories, seedProducts, seedSettings } from './seed-data.js';

/**
 * Popula o banco na primeira subida.
 *
 * É idempotente e conservador: só escreve quando a tabela correspondente está
 * vazia, então reiniciar o servidor (ou o container) nunca sobrescreve o que o
 * admin já editou. Para recriar tudo existe o script `npm run db:reset`.
 */
export function seedDatabase(db) {
  const empty = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM settings)   AS settings,
         (SELECT COUNT(*) FROM categories) AS categories,
         (SELECT COUNT(*) FROM products)   AS products`,
    )
    .get();

  if (empty.settings === 0) {
    db.prepare(
      `INSERT INTO settings (
         id, store_name, tagline, whatsapp, whatsapp_label, instagram, instagram_url,
         email, address, city, hours_json, payments_json, wholesale_min, free_shipping_note
       ) VALUES (1, @storeName, @tagline, @whatsapp, @whatsappLabel, @instagram, @instagramUrl,
                 @email, @address, @city, @hours, @payments, @wholesaleMin, @freeShippingNote)`,
    ).run({
      ...seedSettings,
      hours: JSON.stringify(seedSettings.hours),
      payments: JSON.stringify(seedSettings.payments),
    });
    console.log('[db] settings iniciais criadas');
  }

  if (empty.categories === 0) {
    const insert = db.prepare(
      `INSERT INTO categories (id, name, emoji, tone, position)
       VALUES (@id, @name, @emoji, @tone, @position)`,
    );
    const insertAll = db.transaction((categories) => {
      categories.forEach((category, index) => insert.run({ ...category, position: index }));
    });
    insertAll(seedCategories);
    console.log(`[db] ${seedCategories.length} categorias criadas`);
  }

  if (empty.products === 0) {
    const insert = db.prepare(
      `INSERT INTO products (
         slug, name, category_id, description, details_json, tags_json, colors_json,
         price_cents, wholesale_cents, min_wholesale, featured, active, position
       ) VALUES (
         @slug, @name, @categoryId, @description, @details, @tags, @colors,
         @priceCents, @wholesaleCents, @minWholesale, @featured, 1, @position
       )`,
    );
    const insertAll = db.transaction((products) => {
      products.forEach((product, index) =>
        insert.run({
          ...product,
          details: JSON.stringify(product.details ?? []),
          tags: JSON.stringify(product.tags ?? []),
          colors: JSON.stringify(product.colors ?? []),
          minWholesale: product.minWholesale ?? seedSettings.wholesaleMin,
          featured: product.featured ? 1 : 0,
          position: index,
        }),
      );
    });
    insertAll(seedProducts);
    console.log(`[db] ${seedProducts.length} produtos criados`);
  }
}
