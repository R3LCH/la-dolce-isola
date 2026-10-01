import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE: '/la-dolce-isola/' for GitHub Pages, '/' for a dedicated server.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(three|@react-three)/.test(id)) return 'three'
          if (id.includes('node_modules/gsap')) return 'gsap'
          return undefined
        },
      },
    },
  },
})
