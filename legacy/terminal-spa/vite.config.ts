import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'esnext',
    // Minify with esbuild for faster builds
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk: Vue ecosystem
          'vendor-vue': ['vue', 'pinia'],
          // Animations chunk: GSAP
          'vendor-animations': ['gsap'],
          // Utils chunk: VueUse
          'vendor-utils': ['@vueuse/core']
        }
      }
    }
  }
})
