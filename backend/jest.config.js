module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true
};
