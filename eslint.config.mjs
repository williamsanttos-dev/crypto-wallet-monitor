// @ts-check
import eslint from '@eslint/js';
import prettierRecommend from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';
import secureConfig from 'eslint-plugin-secure-coding';
import nodeSecurity from 'eslint-plugin-node-security';
import jwt from 'eslint-plugin-jwt';
import pg from 'eslint-plugin-pg';
import nestjsSecurity from 'eslint-plugin-nestjs-security';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'generated/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierRecommend,

  // security plugins
  secureConfig.configs?.recommended,
  nodeSecurity.configs?.recommended,
  jwt.configs?.recommended,
  pg.configs?.recommended,
  nestjsSecurity.configs?.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'node-security/lock-file': 'off',
      'nestjs-security/require-guards': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...jest.environments.globals.globals,
      },
    },
    plugins: { jest },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'off',
    },
  },
];
