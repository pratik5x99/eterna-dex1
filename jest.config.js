/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true, // Forces Jest to close after tests (useful for Redis/DB connections)
  detectOpenHandles: true,
};