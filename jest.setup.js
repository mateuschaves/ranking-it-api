// Mock passport module for tests
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => next()),
  use: jest.fn(),
  initialize: jest.fn(),
  session: jest.fn(),
}));

// Mock @nestjs/passport AuthGuard
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => class MockAuthGuard {
    canActivate() {
      return true;
    }
  }),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
}); 