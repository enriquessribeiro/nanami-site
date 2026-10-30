# nanami-backend

Express 5 + SQLite (`better-sqlite3`): API pública do catálogo, autenticação do
admin, CRUD do painel, uploads e o servidor que entrega o build do front.

Visão geral do projeto, como rodar, deploy e decisões de segurança estão no
[README da raiz](../README.md).

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3001
npm test           # 48 testes (banco em memória)
npm run db:reset   # apaga e recria o banco local com o seed fictício
```

## Código

```
src/
  server.js          boot: config, banco, seed, admin, listen, shutdown
  app.js             middlewares, rotas, tratamento de erro
  static.js          serve o build do Vite (loja + painel) com CSP
  config.js          env lida uma vez no boot
  db/
    migrations/      .sql aplicados em ordem (PRAGMA user_version)
    seed-data.js     catálogo fictício (preços em centavos)
    seed.js          seed idempotente
  auth/              senhas (Argon2id), sessões, rate limit, rotas
  services/          catálogo público, CRUD do admin, uploads
  routes/            API pública, admin, mídia
```

- Migrations são aplicadas no boot e controladas por `PRAGMA user_version`:
  para mudar o schema, adicione `003_....sql` — nunca edite uma migration já
  aplicada.
- `data/` e `uploads/` são ignorados pelo git; em Docker viram os volumes
  `nanami_data` e `nanami_uploads`.

## Deploy

`Dockerfile`, `docker-compose.yml`, `Caddyfile` e `.env.example` ficam aqui.
O contexto do build é a raiz do repositório (`..`), então o front precisa estar
em `../nanami-frontend`.
