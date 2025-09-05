// eslint.config.mts
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsparser,
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
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
];
