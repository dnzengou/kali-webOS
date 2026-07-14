import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Skip shadcn library files and provider modules (need non-component exports)
  globalIgnores([
    'dist',
    'src/components/ui/**',
    'src/providers/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Recharts formatters and agent-registry icon lookups use legitimate any
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow terse ternary setters
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
      // React Compiler rules — enabled but downgraded (legit patterns like
      // reset-on-deps-change and setState-in-tick-callback trip them)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
])
