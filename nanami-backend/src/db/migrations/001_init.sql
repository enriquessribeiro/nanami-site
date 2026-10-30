-- Fase 2: catálogo público.

CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  store_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  whatsapp_label TEXT NOT NULL,
  instagram TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  hours_json TEXT NOT NULL DEFAULT '[]',
  payments_json TEXT NOT NULL DEFAULT '[]',
  wholesale_min INTEGER NOT NULL DEFAULT 6 CHECK (wholesale_min > 0),
  free_shipping_note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  -- Tom usado pelo gatinho/ilustração da categoria no front.
  tone TEXT NOT NULL DEFAULT 'rosa',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  description TEXT NOT NULL DEFAULT '',
  details_json TEXT NOT NULL DEFAULT '[]',
  tags_json TEXT NOT NULL DEFAULT '[]',
  colors_json TEXT NOT NULL DEFAULT '[]',
  -- Dinheiro sempre em centavos inteiros: nunca float no banco nem na API.
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  wholesale_cents INTEGER NOT NULL CHECK (wholesale_cents > 0),
  min_wholesale INTEGER NOT NULL DEFAULT 6 CHECK (min_wholesale > 0),
  image TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (wholesale_cents <= price_cents)
);

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_active_position ON products (active, position);
