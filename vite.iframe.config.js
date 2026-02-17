import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const base = env['VITE_BASE_URL'];

  return {
    base,
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
  };
});
