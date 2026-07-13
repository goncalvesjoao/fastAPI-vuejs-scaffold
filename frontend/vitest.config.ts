import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import { baseViteConfig } from './vite.config'

export default mergeConfig(
  baseViteConfig,
  defineConfig({
    define: {
      'import.meta.env.VITE_NO_AUTH': JSON.stringify('true'),
      'import.meta.env.VITE_NO_AUTH_TOKEN': JSON.stringify('current_user'),
    },
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./tests/support/setup.ts'],
    },
  }),
)
