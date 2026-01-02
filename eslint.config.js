// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig(
  // 1. Global Ignores
  globalIgnores(['dist/', 'node_modules/', '.astro/', 'public/', 'src/types/v86.d.ts']),

  // 2. JavaScript Base
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 3. TypeScript
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 4. Astro
  {
    files: ['**/*.astro'],
    extends: [...eslintPluginAstro.configs.recommended],
  },

  // 5. React 19 (JSX/TSX)
  {
    files: ['**/*.{jsx,tsx}'],
    extends: [reactPlugin.configs.flat.recommended, reactPlugin.configs.flat['jsx-runtime']],
    plugins: {
      'react-compiler': reactCompiler,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React Compiler (Mandatory for React 19)
      'react-compiler/react-compiler': 'error',

      // Disable prop-types when using TypeScript
      'react/prop-types': 'off',
    },
  },

  // 6. React Hooks
  {
    files: ['**/*.{jsx,tsx,ts}'],
    extends: [reactHooksPlugin.configs.flat.recommended],
  },

  // 7. Unused Imports
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx,astro}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 8. Node.js Scripts
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  }
);
