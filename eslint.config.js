import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist',
      'server/data',
      // Alter 3D-Flow: nicht mehr eingebunden und zum Löschen vorgesehen (siehe README → „Aufräumen“).
      'src/three/**',
      'src/lib/{textures,random,scroll,cursor}.js',
      'src/components/{Hero3D,TeamCarousel3D,MarketStand3D,MarketCanvas,ThankYouSection,LoadingScreen,SoundToggle}.jsx',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['server/**/*.js', 'shared/**/*.js', 'vite.config.js', 'eslint.config.js', 'test/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
