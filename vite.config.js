import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/client': {
        target: 'http://192.168.0.200:200', // URL do backend
        changeOrigin: true,
        secure: false, // Define como false se o backend não usar HTTPS
        rewrite: (path) => path.replace(/^\/client/, ''), // Remove a parte do caminho '/client' se necessário
      },
    },
    host: '192.168.0.200', // Ou use um IP específico, como '192.168.1.100'
    port: 201, // Porta do servidor de desenvolvimento Vite
  },
})
