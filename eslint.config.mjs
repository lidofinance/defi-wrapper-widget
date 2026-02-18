import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react: react,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      boundaries: boundaries,
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'boundaries/elements': [
        {
          type: 'feature',
          pattern: 'src/features/*',
        },
        {
          type: 'global-feature',
          pattern: '@/features/*',
        },
        {
          type: 'shared',
          pattern: '@/shared/*',
        },
      ],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'prefer-const': 'error',

      'boundaries/element-types': [
        'error',
        {
          rules: [
            {
              from: 'feature',
              disallow: ['feature', 'global-feature'],
              allow: ['shared'],
              message: 'Features must not import from other features',
            },
          ],
        },
      ],
      'react/display-name': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
      'react-hooks/exhaustive-deps': ['error'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_*',
        },
      ],
      'func-style': ['error', 'expression'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/**'],
              message:
                'Imports from @/features are forbidden. Use shared or relative imports.',
            },
          ],
        },
      ],
      'import/order': [
        'warn',
        {
          pathGroups: [
            {
              pattern: '{react,react-dom,wagmi,viem}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '@chakra-ui/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: './**',
              group: 'sibling',
              position: 'after',
            },
            {
              pattern: '../**',
              group: 'parent',
              position: 'after',
            },
            {
              pattern: '@/(utils|assets|types)/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: 'assets/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          'newlines-between': 'ignore',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['src/app.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  //prettierRecommended,
);
