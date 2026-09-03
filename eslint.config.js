import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Prosjektet bruker ikke prop-types.
      'react/prop-types': 'off',
      // Bevisst ignorerte catch-variabler skal ikke feile bygget.
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      // Ny regel i react-hooks v7. TimeCalculator beregner avledet state i en
      // effect; å gjøre den om til render-avledet verdi er en egen oppgave.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
