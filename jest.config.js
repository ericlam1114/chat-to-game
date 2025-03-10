// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };