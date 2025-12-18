import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(async ({ mode }) => {
  const checker = (await import('vite-plugin-checker')).default;
  mode = mode === 'production' || mode === 'development' ? '' : mode;

  const env = loadEnv(mode, process.cwd());
  const base = env['VITE_BASE_URL'];
  const port = env['VITE_PORT'] || 3017;
  const outDir = env['VITE_OUT_DIR'] || `./dist`;

  return {
    base,
    plugins: [
      checker({
        typescript: {
          tsconfigPath: 'tsconfig.json',
        },
      }),
      svgr(),
      react(),
    ],
    server: {
      port,
    },
    build: {
      outDir,
    },
    resolve: {
      alias: {
        assets: path.resolve(__dirname, './assets'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Define environment variables to be injected at build time
    define: {
      'process.env': env,
    },
  };
});
