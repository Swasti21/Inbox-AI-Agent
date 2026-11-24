import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/triage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/approve': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/runs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
