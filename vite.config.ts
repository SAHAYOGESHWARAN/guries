
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 5173,
      host: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3003',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://localhost:3003',
          changeOrigin: true,
          ws: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: process.env.NODE_ENV === 'development',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      reportCompressedSize: false, // Speeds up build
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('socket.io-client')) {
                return 'socket-vendor';
              }
              // Other large vendor libraries
              return 'vendor';
            }
            // View chunks - group views by feature area
            if (id.includes('/views/')) {
              const viewName = id.split('/views/')[1].split('.')[0];
              // Group master views together
              if (viewName.includes('Master') || viewName.includes('Config')) {
                return 'master-views';
              }
              // Group analytics views
              if (viewName.includes('Analytics') || viewName.includes('Dashboard') || viewName.includes('Scorecard')) {
                return 'analytics-views';
              }
              // Group repository views
              if (viewName.includes('Repository') || viewName.includes('View')) {
                return 'repository-views';
              }
            }
          },
        },
      },
    },
  };
});
