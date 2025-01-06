// vite.config.js - Vite configuration for the project

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000', // Target backend server
        ws: true, // Enable WebSocket proxying
        changeOrigin: true, 
      },
    },
    open: true, // Automatically launch the app in the browser
    port: 8080, // Custom port for the development server
  },
  build: {
    outDir: 'output', 
    sourcemap: true, // Enable source maps for debugging
  },
});
