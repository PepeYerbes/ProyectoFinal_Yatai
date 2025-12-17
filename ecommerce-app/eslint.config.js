import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    files: ['src/**/*.{js,ts}'],
    ignores: [
      '**/node_modules/**',
      '**/.angular/**',
      '**/dist/**',
      '**/*.spec.ts',
      '**/environments/**'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: false,
        console: false,
        document: false,
        navigator: false,
        ngDevMode: true,
        process: false
      },
      parser: tsParser,
      // Si necesitas reglas que usen comprobación de tipos, añade un override con parserOptions.project apuntando al tsconfig app efectivo.
      parserOptions: {
        ecmaVersion: 2022,
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-empty-function': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-undef': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-case-declarations': 'off',
      'no-constant-condition': 'off',
      'no-unsafe-finally': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
];
