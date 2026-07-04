import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import { baseViteConfig } from './vite.config'

export default mergeConfig(
  baseViteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
