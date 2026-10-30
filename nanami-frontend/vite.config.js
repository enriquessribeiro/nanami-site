import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // A API roda em outro processo nesta máquina, mas o navegador precisa ver
    // tudo como mesma origem: é o que mantém o cookie de sessão (SameSite=Strict,
    // Secure, __Host-) funcionando sem abrir CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false,
      },
    },
  },
  build: {
    rollupOptions: {
      // Duas entradas: a loja e o painel. O painel é um app separado de
      // propósito — não carrega nada do loja e vice-versa.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
})
