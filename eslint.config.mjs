// eslint.config.mjs
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Global ignores - these files/patterns will be ignored across all configurations
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**', '*.config.js', '*.config.mjs', 'jest.config.js', 'jest.config.ts', 'jest.setup.ts']
  },
  {
    files: ['**/*.ts', '**/*.js'],

    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },

    rules: {
      // Reglas base recomendadas de TS
      ...tseslint.configs.recommended.rules,

      // Desactiva conflictos entre ESLint y Prettier
      ...prettierConfig.rules,

      // Evitar duplicados con la regla base
      'no-unused-vars': 'off',

      // Personalizadas:
      // Permite variables/args/errores "no usados" si comienzan con "_"
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Si alguna config externa activara esta regla, la apagamos
      'no-underscore-dangle': 'off',

      // Otras reglas
      'no-console': 'warn',

      // Reglas clásicas
      semi: ['error', 'always'],
      quotes: ['error', 'single'],

      // Reglas adicionales para mejorar la calidad del código
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error', // This is a core ESLint rule, not TypeScript ESLint
      '@typescript-eslint/no-var-requires': 'error',

      // Prettier integrado con opciones explícitas:
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          printWidth: 140,
          tabWidth: 2,
          bracketSpacing: true,
          arrowParens: 'always',
        },
      ],
    },
  },

  // Configuración específica para archivos de test
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      // Permitir any en tests para simplificar mocks
      '@typescript-eslint/no-explicit-any': 'off',
      // Permitir console en tests
      'no-console': 'off',
      // Permitir variables no usadas en tests (para setup/teardown)
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
