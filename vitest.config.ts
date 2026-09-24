import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        root: fileURLToPath(new URL('./', import.meta.url)),
        projects: [
          {
            extends: true,
            test: {
              name: 'web',
              environment: 'jsdom',
              include: ['src/**/*.{test,spec}.ts'],
              exclude: [...configDefaults.exclude, 'e2e/**'],
            },
          },
          {
            extends: true,
            test: {
              name: 'convex',
              // Matches the Convex runtime; see https://docs.convex.dev/testing/convex-test
              environment: 'edge-runtime',
              include: ['convex/**/*.test.ts'],
              server: { deps: { inline: ['convex-test'] } },
            },
          },
        ],
      },
    }),
  ),
)
