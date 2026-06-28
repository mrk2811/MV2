/**
 * Home Screen Tests
 *
 * Covers home screen issues discovered during development:
 * - User is greeted by first name (not phone number)
 * - Fallback to phone number if no first name
 * - Fallback to 'Member' if neither available
 * - Sign out button present
 * - Navigation to wizard and discover screens
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../app/index';

// --- Clerk mock ---

let mockUser: Record<string, unknown> | null = {
  firstName: 'John',
  lastName: 'Doe',
  phoneNumbers: [{ phoneNumber: '+15551234567' }],
};

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    signOut: jest.fn(),
  }),
  useUser: () => ({
    user: mockUser,
    isLoaded: true,
  }),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('../src/components/WizardButton', () => ({
  WizardButton: ({ title }: { title: string }) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

// --- Tests ---

describe('Home Screen', () => {
  beforeEach(() => {
    mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumbers: [{ phoneNumber: '+15551234567' }],
    };
  });

  it('should greet user by first name (bug fix: was showing phone number)', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hey, John')).toBeTruthy();
  });

  it('should fall back to phone number if first name is missing', () => {
    mockUser = {
      firstName: null,
      phoneNumbers: [{ phoneNumber: '+15551234567' }],
    };
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hey, +15551234567')).toBeTruthy();
  });

  it('should fall back to Member if no name or phone', () => {
    mockUser = {
      firstName: null,
      phoneNumbers: [],
    };
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hey, Member')).toBeTruthy();
  });

  it('should show Sign Out button', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Sign Out')).toBeTruthy();
  });

  it('should show Discover Apps and Create Your App buttons', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Discover Apps')).toBeTruthy();
    expect(getByText('Create Your App')).toBeTruthy();
  });

  it('should show MV2 logo and tagline', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('MV2')).toBeTruthy();
    expect(getByText('Your apps. Your dating pools.')).toBeTruthy();
  });
});
