import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  prettier,
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: '.',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      react,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      boundaries,
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
      '@typescript-eslint/require-await': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-shadow': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      '@next/next/no-img-element': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
      'react-hooks/exhaustive-deps': ['error'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
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
  },
  {
    files: ['src/app.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
