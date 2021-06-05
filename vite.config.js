import { defineConfig } from 'vite'

export default defineConfig({
  base: '/npodice/',
  build: {
    chunkSizeWarningLimit: 800,
  },
})
