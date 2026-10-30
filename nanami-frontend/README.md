# Nanami — frontend

React 19 + Vite + Tailwind v4. Duas entradas:

- `index.html` — a loja.
- `admin.html` — o painel (app separado; não carrega código da loja).

```bash
npm install
npm run dev     # http://localhost:5173 (proxy de /api para :3001)
npm run build   # gera dist/index.html e dist/admin.html
npm run lint
```

A API precisa estar rodando em `http://localhost:3001` (`cd ../nanami-backend && npm run dev`).

## Organização

```
src/
  components/        peças da loja (Header, Footer, ProductCard, CartDrawer...)
  components/ui/     primitivos (Button, Tag, IconButton, Container, ...)
  context/           estado da loja: catálogo, carrinho, modo, rota, toast
  views/             Home, Catalog, Product, Store
  lib/               formatação de preço (centavos → BRL), WhatsApp, mídia
  styles/            tema Tailwind (@theme) + index.css (pouco CSS restante)
  admin/             painel: login, produtos, categorias, configurações
```

## Decisões

- **Tailwind v4 com config CSS-first** (`src/styles/tailwind.css`): a paleta e
  os tokens semânticos vivem em `@theme`/`@theme inline`, o que mantém o dark
  mode (`prefers-color-scheme`) funcionando sem repetir `dark:` em cada classe.
- **CSS que sobrou em `index.css`**: blob/brilho do hero, animação dos gatinhos,
  fundo do mapa e keyframes — coisas que não valem a pena virar utilitário.
- **Dinheiro em centavos**: a API manda `priceCents`; `formatPrice` converte
  para BRL só na exibição.
- **Catálogo carregado uma vez** (`GET /api/catalog`) e filtrado em memória: o
  catálogo é pequeno e isso deixa busca/ordenação instantâneas.
- **Carrinho persistido e reconciliado**: ao abrir o site, itens que saíram do
  catálogo são descartados e preços/mínimos são atualizados com os valores do
  servidor, para o pedido no WhatsApp nunca sair com preço velho.
- **Foto opcional**: quando o produto não tem imagem, o card usa a ilustração
  SVG (`ProductArt`) gerada a partir da categoria.
