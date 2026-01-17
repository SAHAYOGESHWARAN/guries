import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
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
        },
        server: {
            port: 5173,
            host: true,
            watch: {
                usePolling: true,
            },
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                    secure: false,
                },
                '/socket.io': {
                    target: 'http://localhost:3001',
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
            cssCodeSplit: false,
            reportCompressedSize: false,
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                },
            },
        },
    };
});
