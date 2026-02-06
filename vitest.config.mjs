import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/lib/hooks/**', 'src/lib/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'pg': resolve(__dirname, './tests/mocks/pg'),
      '@auth/pg-adapter': resolve(__dirname, './tests/mocks/auth-pg-adapter'),
    },
  },
})
