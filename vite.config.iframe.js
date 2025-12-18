import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr(), react()],
  server: {
    port: 3008,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'iframe.html',
    },
  },
  resolve: {
    alias: {
      assets: path.resolve(__dirname, './assets'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Define environment variables to be injected at build time
  define: {
    'process.env': process.env,
  },
});
