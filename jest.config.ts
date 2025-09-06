import type { Config } from 'jest';

const config: Config = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@application$': '<rootDir>/src/application/index.ts',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@config$': '<rootDir>/src/config/index.ts',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@domain$': '<rootDir>/src/domain/index.ts',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infrastructure$': '<rootDir>/src/infrastructure/index.ts',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@interfaces$': '<rootDir>/src/interfaces/index.ts',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@presentation$': '<rootDir>/src/presentation/index.ts',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared$': '<rootDir>/src/shared/index.ts',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
};

export default config;
