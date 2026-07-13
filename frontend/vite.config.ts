import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig, loadEnv, normalizePath, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = fileURLToPath(new URL('./src', import.meta.url))

function i18nCallerPathPlugin(): PluginOption {
  return {
    name: 'scaffold-i18n-caller-path',
    enforce: 'pre',
    transform(code, id) {
      if (!code.includes('useI18n(import.meta.url)')) return

      const [filePath] = id.split('?')
      if (!filePath) return

      const sourceRelativePath = path.relative(srcRoot, filePath)
      if (sourceRelativePath.startsWith('..') || path.isAbsolute(sourceRelativePath)) return

      const callerPath = normalizePath(sourceRelativePath).replace(/\.[^/.?]+$/, '')

      return code.replaceAll('useI18n(import.meta.url)', `useI18n('${callerPath}')`)
    },
  }
}

export const baseViteConfig = {
  plugins: [i18nCallerPathPlugin(), vue(), vueJsx(), vueDevTools(), ui()],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
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
  const frontendSentryDsn = env.VITE_SENTRY_DSN?.trim()
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN?.trim()
  const sentryOrg = env.SENTRY_ORG?.trim()
  const sentryProject = env.SENTRY_PROJECT?.trim()
  const uploadSourcemaps = Boolean(
    frontendSentryDsn && sentryAuthToken && sentryOrg && sentryProject,
  )
  const backendPort = parseInt(env.PORT || env.BACKEND_PORT || '8000')
  const frontendPort = parseInt(env.PORT || env.FRONTEND_PORT || '5173')
  const defineEnv = (value: string | undefined) =>
    value === undefined ? 'undefined' : JSON.stringify(value)

  return {
    ...baseViteConfig,
    plugins: [
      ...baseViteConfig.plugins,
      ...(uploadSourcemaps
        ? [
            sentryVitePlugin({
              authToken: sentryAuthToken,
              org: sentryOrg,
              project: sentryProject,
            }),
          ]
        : []),
    ],
    build: {
      ...baseViteConfig.build,
      sourcemap: Boolean(frontendSentryDsn),
    },
    server: {
      ...baseViteConfig.server,
      port: frontendPort,
      proxy: {
        '/api': `http://localhost:${backendPort}`,
      },
    },
    define: {
      'import.meta.env.VITE_NO_AUTH': defineEnv(env.NO_AUTH),
      'import.meta.env.VITE_NO_AUTH_TOKEN': defineEnv(env.NO_AUTH_TOKEN),
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': defineEnv(env.CLERK_PUBLISHABLE_KEY),
      'import.meta.env.VITE_SENTRY_DSN': defineEnv(frontendSentryDsn),
    },
  }
})
