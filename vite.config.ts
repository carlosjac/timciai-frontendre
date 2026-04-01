import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite does not load `.env` into `process.env` for this file unless we use `loadEnv`.
 * Proxy target defaults to 127.0.0.1 (not `localhost`) to avoid IPv6 (::1) vs IPv4-only API listeners → 502.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const explicitTarget = env.VITE_PROXY_TARGET?.trim();
  const port = env.VITE_BACKEND_PORT?.trim() || '3000';
  const proxyTarget = explicitTarget || `http://127.0.0.1:${port}`;
  if (mode === 'development') {
    console.info(`[vite] Dev server will proxy /v1, /api, /health → ${proxyTarget}`);
  }

  const proxyCommon = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
  };

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '^/v1/': proxyCommon,
        '^/api': proxyCommon,
        '^/health': proxyCommon,
      },
    },
    build: {
      sourcemap: true,
    },
  };
});
