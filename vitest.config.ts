import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    // Absolute origin for Node fetch + MSW (config.getV1Base).
    'import.meta.env.VITE_API_URL': JSON.stringify('http://127.0.0.1'),
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/shared/**/*.ts', 'src/providers/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/index.ts', 'src/test/**'],
    },
  },
});
