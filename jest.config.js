module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^shuttle-state$': '<rootDir>/src/index.ts',
  },
  modulePathIgnorePatterns: ['dist'],
  testRegex: 'test.(js|ts|tsx)$',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  coverageReporters: ['json', 'html', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{js,ts,tsx}', 'tests/**/*.{js,ts,tsx}'],
};
