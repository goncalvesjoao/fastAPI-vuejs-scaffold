import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/

export const baseViteConfig = {
  plugins: [vue(), vueJsx(), vueDevTools(), ui()],
  build: {
    outDir: '../backend/spa',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  const backendPort = parseInt(env.PORT || env.BACKEND_PORT || '8000')
  const frontendPort = parseInt(env.PORT || env.FRONTEND_PORT || '5173')
  const defineEnv = (value: string | undefined) =>
    value === undefined ? 'undefined' : JSON.stringify(value)

  return {
    ...baseViteConfig,
    server: {
      port: frontendPort,
      proxy: {
        '/api': `http://localhost:${backendPort}`,
      },
    },
    define: {
      'import.meta.env.VITE_NO_AUTH': defineEnv(env.NO_AUTH),
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': defineEnv(env.CLERK_PUBLISHABLE_KEY),
    },
  }
})
