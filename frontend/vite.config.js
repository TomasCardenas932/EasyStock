import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Redirige las llamadas /api al backend en desarrollo
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
