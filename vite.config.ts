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
    // Dev only: local backends often use plain HTTP; never rely on this for production.
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
      // Do not publish source maps on the public CDN (reduces reverse-engineering surface).
      sourcemap: false,
      // Ant Design + icons stay ~1.2 MB minified as a shared vendor; app/route chunks are far smaller.
      chunkSizeWarningLimit: 1300,
      rolldownOptions: {
        output: {
          /** Keep heavy vendors out of the app entry so route chunks stay smaller. */
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@tiptap')) return 'vendor-tiptap';
            if (id.includes('isomorphic-dompurify') || id.includes('/dompurify')) {
              return 'vendor-sanitize';
            }
            if (id.includes('@refinedev')) return 'vendor-refine';
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
            if (
              id.includes('/react-dom') ||
              id.includes('/react-router') ||
              id.includes('/scheduler') ||
              /[/\\]node_modules[/\\]react[/\\]/.test(id)
            ) {
              return 'vendor-react';
            }
          },
        },
      },
    },
  };
});
