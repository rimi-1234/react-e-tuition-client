import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // No eslint-plugin-react here, so JSX usage (<Icon />) is invisible to this rule:
      // PascalCase names are treated as components and ignored.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]', ignoreRestSiblings: true }],
    },
  },
  {
    // Providers, motion bindings, the router and a few UI modules intentionally export
    // hooks/helpers next to components. This rule only affects dev hot-reload granularity.
    files: ['src/providers/**', 'src/motion/**', 'src/routes/**', 'src/components/ui/feedback.jsx', 'src/components/tuition/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
