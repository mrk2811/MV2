// Silence console.warn in tests (Clerk logs, etc.)
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Mock Alert.alert so we can assert on it
jest.spyOn(require('react-native').Alert, 'alert');

// Mock Keyboard.dismiss so we can assert on it
jest.spyOn(require('react-native').Keyboard, 'dismiss');

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  withScope: jest.fn(),
}));
