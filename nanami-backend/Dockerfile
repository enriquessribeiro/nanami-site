# ---------- 1. build do frontend (loja + painel) ----------
FROM node:22-bookworm-slim AS frontend
WORKDIR /app

COPY nanami-frontend/package.json nanami-frontend/package-lock.json ./
RUN npm ci

COPY nanami-frontend/ ./
RUN npm run build

# ---------- 2. dependências de produção do backend ----------
FROM node:22-bookworm-slim AS backend-deps
WORKDIR /app

# better-sqlite3 e sharp baixam binários nativos: precisam de toolchain só se o
# prebuilt não existir para a plataforma.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- 3. imagem final ----------
FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/data \
    UPLOAD_DIR=/uploads \
    STATIC_DIR=/app/public

COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY --from=frontend /app/dist ./public

# O processo roda como usuário sem privilégios. Os volumes /data e /uploads
# são criados pela imagem e recebem a mesma dona, senão o SQLite não escreve.
RUN mkdir -p /data /uploads \
 && chown -R node:node /data /uploads /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
