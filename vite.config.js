import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    server: {
        port: 1688,
        host: true
    },
    build: {
        cssMinify: false,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('@supabase/supabase-js'))
                            return 'vendor-supabase';
                        if (id.includes('@tanstack/react-query'))
                            return 'vendor-query';
                        if (id.includes('@react-three/') || id.includes('node_modules/three'))
                            return 'vendor-three';
                        if (id.includes('react-router'))
                            return 'vendor-react';
                        if (id.includes('react-dom'))
                            return 'vendor-react';
                        if (id.includes('node_modules/react'))
                            return 'vendor-react';
                    }
                }
            }
        }
    }
});
