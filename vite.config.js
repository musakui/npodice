import { defineConfig } from 'vite'

import { visualizer } from 'rollup-plugin-visualizer'
const vis = visualizer({
  json: true,
  brotliSize: true,
  filename: 'stats/stats.json',
})

export default defineConfig({
  base: '/npodice/',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      plugins: [
        vis,
      ],
    },
  },
})
