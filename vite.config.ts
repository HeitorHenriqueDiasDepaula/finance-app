import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Em desenvolvimento o frontend chama o backend em /api, e o Vite repassa para o servidor
// (por padrão o mock-server em localhost:3000). Assim não há CORS nem porta extra para expor.
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // permite o domínio de encaminhamento de portas do GitHub Codespaces
    allowedHosts: ['.app.github.dev'],
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
})
