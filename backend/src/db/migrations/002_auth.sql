-- Fase 3: usuário admin e sessões.

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER,
  -- Hash trocado a cada mudança de senha; sessões antigas guardam o hash com
  -- que nasceram e caem sozinhas quando ele muda.
  password_version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Só o SHA-256 do token é guardado: vazar o banco não entrega sessão válida.
  token_hash TEXT NOT NULL UNIQUE,
  admin_id INTEGER NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  password_version INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX idx_sessions_admin ON sessions (admin_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);
