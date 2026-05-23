// Silence console.warn in tests (Clerk logs, etc.)
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Mock Alert.alert so we can assert on it
jest.spyOn(require('react-native').Alert, 'alert');

// Mock Keyboard.dismiss so we can assert on it
jest.spyOn(require('react-native').Keyboard, 'dismiss');
