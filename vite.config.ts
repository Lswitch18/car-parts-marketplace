import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const buildConfig: UserConfig['build'] = {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-query': ['@tanstack/react-query'],
      }
    }
  }
}

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
  build: buildConfig
})