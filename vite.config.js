import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(async ({ mode }) => {
  const checker = (await import('vite-plugin-checker')).default;
  const sri = (await import('vite-plugin-sri-gen')).default;
  mode = mode === 'production' || mode === 'development' ? '' : mode;

  const env = loadEnv(mode, process.cwd());
  // Build-only configuration is read from unprefixed env vars so it never
  // reaches the client bundle. Legacy VITE_-prefixed names are kept as
  // fallback for backward compatibility.
  const buildEnv = loadEnv(mode, process.cwd(), '');
  // Note: empty-string base is meaningful (relative asset paths, relied on by
  // the Pages deploy), so fall back on absence only — not on emptiness
  const base = buildEnv['BASE_URL'] ?? buildEnv['VITE_BASE_URL'];
  const port = buildEnv['PORT'] || buildEnv['VITE_PORT'] || 3017;
  const outDir = buildEnv['OUT_DIR'] || buildEnv['VITE_OUT_DIR'] || `./dist`;

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
      sri(),
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
    test: {
      environment: 'node',
      globals: true,
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      coverage: {
        provider: 'v8',
        include: ['src/utils/**', 'src/features/**/shared/utils.ts'],
        exclude: ['src/utils/encodable.ts'],
      },
    },
  };
});
