import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' ? visualizer({ filename: 'build/stats.html', open: false, gzipSize: true, brotliSize: true }) : undefined
  ].filter(Boolean),
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}))