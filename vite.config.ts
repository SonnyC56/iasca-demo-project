import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // In dev the browser talks to Convex through this server (same origin), so a phone on the
  // LAN only needs port 5173. `npx convex dev` writes these URLs to .env.local.
  const convexUrl = env.VITE_CONVEX_URL || 'http://127.0.0.1:3210'
  const convexSiteUrl = env.VITE_CONVEX_SITE_URL || 'http://127.0.0.1:3211'
  const https = env.DEV_HTTPS === '1'

  return {
    plugins: [vue(), vueDevTools(), tailwindcss(), ...(https ? [basicSsl()] : [])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        // Convex sync websocket + HTTP API. App routes must not use /api or /http.
        '/api': { target: convexUrl, ws: true, changeOrigin: true },
        // Convex HTTP actions (auth routes, webhooks).
        '/http': {
          target: convexSiteUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/http/, ''),
        },
      },
    },
  }
})
