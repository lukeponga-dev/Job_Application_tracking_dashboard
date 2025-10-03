const nextEslintPlugin = require('@next/eslint-plugin-next');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat();

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
  },
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    plugins: { 
      '@next/next': nextEslintPlugin,
    },
    rules: {
      ...nextEslintPlugin.configs.recommended.rules,
      ...nextEslintPlugin.configs['core-web-vitals'].rules,
      
      // Recommended changes
      '@next/next/no-duplicate-head': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
