/**
 * Leitura do catálogo público.
 *
 * Tudo aqui é parâmetro de SQL nomeado (better-sqlite3), nunca concatenação de
 * string: mesmo quando o filtro vem da URL, o valor é passado como binding.
 */

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function toStore(row) {
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
    hours: parseJson(row.hours_json, []),
    payments: parseJson(row.payments_json, []),
    wholesaleMin: row.wholesale_min,
    freeShippingNote: row.free_shipping_note,
  };
}

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    cat: row.tone,
  };
}

function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_id,
    description: row.description,
    details: parseJson(row.details_json, []),
    tags: parseJson(row.tags_json, []),
    colors: parseJson(row.colors_json, []),
    // Centavos inteiros. O front formata; a API nunca trafega float de dinheiro.
    priceCents: row.price_cents,
    wholesaleCents: row.wholesale_cents,
    minWholesale: row.min_wholesale,
    image: row.image,
    featured: row.featured === 1,
  };
}

export function readCatalog(db) {
  const storeRow = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const categoryRows = db
    .prepare('SELECT * FROM categories ORDER BY position, name')
    .all();
  const productRows = db
    .prepare('SELECT * FROM products WHERE active = 1 ORDER BY position, name')
    .all();

  return {
    store: storeRow ? toStore(storeRow) : null,
    categories: categoryRows.map(toCategory),
    products: productRows.map(toProduct),
  };
}
