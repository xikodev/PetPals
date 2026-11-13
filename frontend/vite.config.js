import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Where the backend runs during local development (see backend AUTH_BASE_URL).
const backend = process.env.BACKEND_ORIGIN || 'http://localhost:10000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backend,
        // The backend only accepts POST/PATCH whose Origin equals its AUTH_BASE_URL.
        // The browser sends Origin: http://localhost:5173, so the dev proxy rewrites it.
        headers: { Origin: backend },
      },
    },
  },
})
