// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },
  moduleNameMapper: {
    // Core path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    
    // File extensions
    '^(\\.{1,2}/.*)\\.js$': '$1',
    
    // Mocks
    '^@neondatabase/serverless$': '<rootDir>/src/test/__mocks__/neonDbMock.ts',
    '^resend$': '<rootDir>/src/test/__mocks__/resend.ts',
    
    // Service aliases
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    
    // Handle CSS and other static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  setupFiles: [
    '<rootDir>/src/test/setupEnv.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.tsx'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/dist/',
    'src/test/',
    'src/.*\\.d\\.ts$'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|fetch-blob|@testing-library|@babel)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    url: 'http://localhost/'
  },
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/out/',
    '/public/'
  ],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/out/',
    '/public/'
  ]
};