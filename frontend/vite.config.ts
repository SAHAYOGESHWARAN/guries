import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Determine API URL based on environment
    const isProduction = mode === 'production';
    const apiUrl = isProduction
        ? (env.VITE_API_URL || '/api/v1') // Use relative path in production
        : (env.VITE_API_URL || '/api/v1'); // Use relative path in dev - proxy forwards to backend
    const backendTarget = env.VITE_BACKEND_URL || `http://localhost:${env.VITE_BACKEND_PORT || '3004'}`;

    return {
        plugins: [react()],
        root: '.',
        resolve: {
            alias: {
                '@': path.resolve(__dirname),
            },
            dedupe: ['react', 'react-dom'],
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.API_KEY),
            'process.env.VITE_API_URL': JSON.stringify(apiUrl),
        },
        server: {
            port: 5173,
            host: true,
            watch: {
                usePolling: true,
                interval: 1000,
            },
            livereload: true,
            middlewareMode: false,
            fs: {
                strict: false,
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            proxy: {
                '/api': {
                    target: backendTarget,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path,
                },
                '/socket.io': {
                    target: backendTarget,
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
        build: {
            outDir: path.resolve(__dirname, 'dist'),
            sourcemap: process.env.NODE_ENV === 'development',
            minify: 'esbuild',
            cssMinify: true,
            cssCodeSplit: false,
            reportCompressedSize: false,
            chunkSizeWarningLimit: 1500,
            target: 'esnext',
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                    entryFileNames: '[name].[hash].js',
                    chunkFileNames: '[name].[hash].js',
                    assetFileNames: '[name].[hash][extname]',
                },
                external: [],
            },
        },
    };
});
