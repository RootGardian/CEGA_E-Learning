import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'CEGA E-Learning',
        short_name: 'CEGA',
        description: 'Plateforme E-Learning de la CEGA',
        theme_color: '#F8FAFC',
        background_color: '#F8FAFC',
        display: 'standalone',
        icons: [
          {
            src: '/logo1_cega.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/logo1_cega.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true, // Listen on all network interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://localhost:5000',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
