// eslint.config.js - root ESLint configuration shared by api, web, admin and ui-kit.
// Uses ESLint's flat config format. Prettier owns formatting, so formatting rules
// are switched off here (eslint-config-prettier) and ESLint only checks code quality.

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Never lint generated or third-party files
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/uploads/**'],
  },

  js.configs.recommended,

  // Rules for every JavaScript file in the repository (ES modules, Node by default)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // React rules for the three front-end workspaces (browser globals, JSX)
  {
    files: ['web/**/*.{js,jsx}', 'admin/**/*.{js,jsx}', 'ui-kit/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // not needed with the modern JSX transform
      'react/prop-types': 'off', // the project does not use PropTypes
    },
  },

  // Test files: allow test-runner globals (describe, it, expect)
  {
    files: ['**/tests/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },

  // Must come last: turns off any rule that would conflict with Prettier
  prettier,
];
