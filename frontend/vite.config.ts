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
        : (env.VITE_API_URL || 'http://localhost:3003/api/v1');

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
            },
        },
    };
});
