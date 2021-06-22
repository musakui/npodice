import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { visualizer } from 'rollup-plugin-visualizer'
const vis = visualizer({
  json: true,
  brotliSize: true,
  filename: 'stats/stats.json',
})

export default defineConfig({
  base: '/npodice/',
  plugins: [
    vue(),
  ],
  build: {
    cssCodeSplit: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      plugins: [
        vis,
      ],
    },
  },
})
