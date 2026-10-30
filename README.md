# Nanami — loja + painel

Loja de atacado/varejo com catálogo e fechamento pelo WhatsApp (sem gateway de
pagamento), mais um painel administrativo próprio.

```
site-nanami/
├── nanami-frontend/   React 19 + Vite + Tailwind (loja e painel)
├── nanami-backend/    Express 5 + SQLite (better-sqlite3), API, Docker/Caddy
└── README.md
```

O deploy (Docker/Caddy) mora em `nanami-backend/`, porque o backend é o pacote
que vai para o servidor.

## Rodando localmente

Dois processos, com hot reload dos dois lados.

```bash
# terminal 1 — API
cd nanami-backend
cp .env.example .env
npm install
npm run dev            # http://localhost:3001

# terminal 2 — front
cd nanami-frontend
npm install
npm run dev            # http://localhost:5173
```

- Loja: <http://localhost:5173/>
- Painel: <http://localhost:5173/admin.html>

O Vite faz proxy de `/api` para a porta 3001 — por isso tudo é "mesma origem" e
o cookie de sessão funciona sem CORS.

No primeiro boot o banco é criado (`data/nanami.db`), recebe o catálogo fictício
e o admin é criado. **Sem `ADMIN_PASSWORD` no `.env`, uma senha aleatória é
gerada e impressa uma única vez no console da API.**

## Rodando sem Docker (build de produção)

```bash
cd nanami-frontend && npm install && npm run build
cd ../nanami-backend && STATIC_DIR=../nanami-frontend/dist npm start
```

O Express serve o build do Vite e a API na mesma porta (3001).

## Docker

```bash
cd nanami-backend
cp .env.example .env      # ajuste DOMAIN, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d --build
```

- `app`: build do front + API, escutando em `127.0.0.1:3001`.
- `caddy`: TLS automático e proxy para o app (`80`/`443`).
- Volumes: `nanami_data` (SQLite) e `nanami_uploads` (fotos). **Sem eles, todo
  rebuild começaria com o banco vazio.**

O contexto do build é a raiz do monorepo (`..`), então rode o compose de dentro
de `nanami-backend/` com as duas pastas no lugar.

Em produção, troque no `.env`:

```env
DOMAIN=nanami.com.br
PUBLIC_ORIGIN=https://nanami.com.br
ADMIN_PASSWORD=uma-senha-longa-e-unica
```

O Caddy emite o certificado sozinho assim que o DNS do domínio apontar para o
servidor.

### Se o site responder 502 (`lookup app: no such host`)

Sintoma: o Caddy responde, mas não acha o container da API. Confira:

```bash
docker compose ps -a                 # app deve estar Up (healthy)
docker inspect nanami-app-1 --format '{{json .NetworkSettings.Networks}}'
```

Se o `app` estiver sem rede (`{}`), recrie o container — isso reata a rede sem
tocar nos volumes:

```bash
docker compose up -d --force-recreate app
```

Outra causa comum é ter rodado `docker compose up` com nomes de projeto
diferentes (antes/depois de o `name: nanami` existir): aí sobram dois conjuntos
de containers e o Caddy antigo ocupa as portas 80/443. Resolva com
`docker compose -p <projeto-antigo> down --remove-orphans` (sem `-v`).

### Acesso local pelo navegador

`https://localhost` usa o certificado interno do Caddy, então o navegador vai
avisar que a CA não é confiável — aceite o aviso. A versão HTTP (`:80`)
redireciona para HTTPS de propósito.

### Onde hospedar (e a pegadinha do "grátis")

O projeto é um único processo com SQLite em disco. Serviços de deploy "grátis"
como Render/Railway/Koyeb gratuitos usam **disco efêmero**: a cada deploy ou
restart o banco e as fotos somem. Para uso de verdade, as opções sem custo que
funcionam bem são VM:

- **Oracle Cloud Always Free** — 4 vCPU/24 GB ARM, sempre grátis, disco real.
- **Google Cloud e2-micro** — tier gratuito, disco pequeno mas persistente.

Em qualquer uma: instale Docker + compose, clone este repositório, entre em
`nanami-backend/`, `cp .env.example .env`, `docker compose up -d --build`.

> Se um dia usar hospedagem com disco efêmero, é preciso trocar o SQLite por
> Postgres e os uploads por um bucket (S3/R2). Ficou fora do escopo justamente
> porque a loja é pequena e um arquivo só já resolve.

### Backup

O banco inteiro é `data/nanami.db` (+ `-wal`/`-shm`) e as fotos estão em
`uploads/`. Backup consistente com o container rodando:

```bash
docker compose exec app node -e "
  const D = require('better-sqlite3');
  new D('/data/nanami.db').backup('/tmp/backup.db').then(() => console.log('ok'));
"
docker compose cp app:/tmp/backup.db ./backup-$(date +%F).db
docker run --rm -v nanami_uploads:/u -v $PWD:/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /u .
```

## Testes

```bash
cd nanami-backend && npm test        # 48 testes: API, auth, admin, uploads, rate limit
cd ../nanami-frontend && npm run lint && npm run build
```

## API

| Método | Rota              | Acesso | Descrição                             |
| ------ | ----------------- | ------ | ------------------------------------- |
| GET    | `/api/health`     | público| status do processo e do banco         |
| GET    | `/api/catalog`    | público| loja + categorias + produtos ativos   |
| GET    | `/api/media/:file`| público| foto do produto (WebP, nome UUID)     |
| POST   | `/api/auth/login` | público| cria sessão (cookie)                  |
| POST   | `/api/auth/logout`| sessão | encerra a sessão                      |
| GET    | `/api/auth/me`    | sessão | admin logado                          |
| GET/POST/PUT/DELETE | `/api/admin/products` | sessão | CRUD + `/products/:id/image` |
| GET/POST/PUT/DELETE | `/api/admin/categories` | sessão | CRUD de categorias     |
| GET/PUT | `/api/admin/settings` | sessão | configurações da loja             |

Preços trafegam como **inteiros em centavos** (`priceCents`, `wholesaleCents`).

## Estrutura do backend

```
nanami-backend/src/
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

## Variáveis de ambiente

Veja `.env.example`. Destaques:

- `PUBLIC_ORIGIN` — origem pública (ex.: `https://nanami.com.br`). Obrigatória
  em produção para a checagem de `Origin`.
- `TRUST_PROXY=1` — ligue quando estiver atrás de Caddy/Nginx, senão o IP do
  rate limit será sempre o do proxy (ou pior, forjável).
- `STATIC_DIR` — pasta com o build do Vite. Se definida, o Express serve a loja
  e o painel na mesma porta (é o que o Docker faz com `/app/public`).
- `API_RATE_LIMIT_MAX` — requisições por IP a cada 5 min (padrão `600`).
  `/api/health` nunca é limitado.

## Segurança — resumo das decisões

| Área | Decisão |
| --- | --- |
| Senhas | Argon2id (OWASP), mínimo 12 caracteres, sem exigência de símbolos |
| Sessão | Token 256 bits em cookie `__Host-` (HttpOnly, Secure, SameSite=Strict); banco guarda só o SHA-256 |
| Sessão/expiração | 12 h deslizantes + limite absoluto de 7 dias |
| CSRF | SameSite=Strict + checagem de `Origin` em POST/PUT/PATCH/DELETE |
| Login | 5 tentativas por IP+email e 20 por IP a cada 15 min; resposta idêntica para email inexistente |
| Abuso geral | 600 requisições por IP a cada 5 min na API (health de fora) |
| SQL | 100% parametrizado, `foreign_keys=ON`, WAL |
| Dinheiro | Inteiros em centavos em todas as camadas |
| Upload | 5 MB, magic bytes, reescrita em WebP, EXIF removido, nome UUID, fora do webroot |
| Mídia | `/api/media/:file` valida o nome por regex; `nosniff` + CSP `sandbox` |
| XSS | Descrições são texto puro (o front nunca usa `dangerouslySetInnerHTML`) |
| CSP | `script-src 'self'`, fontes do Google liberadas, `frame-ancestors 'none'` |
| Painel | App separado, `noindex`, nenhuma rota admin aparece na loja |

Itens a revisar antes de abrir para o público: trocar a senha gerada, conferir
`PUBLIC_ORIGIN`/`TRUST_PROXY`, e configurar backup automático do volume.
