import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/session': {
        target: 'http://192.168.0.200:200', // URL do backend para sessão
        changeOrigin: true,
        secure: false, // Define como false se o backend não usar HTTPS
        rewrite: (path) => path.replace(/^\/session/, '/session'),
      },
      '/client': {
        target: 'http://192.168.0.200:200', // URL do backend para cliente
        changeOrigin: true,
        secure: false, // Define como false se o backend não usar HTTPS
        rewrite: (path) => path.replace(/^\/client/, '/client'),
      },
    },
    host: '0.0.0.0', // Usar 0.0.0.0 para permitir acesso de outros dispositivos na rede local
    port: 201, // Porta do servidor de desenvolvimento Vite
  },
})
