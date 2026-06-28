/**
 * Sign-In Flow Tests
 *
 * Covers sign-in issues discovered during development:
 * - User can log in via OTP (phone → code → home)
 * - Descriptive error when no account exists
 * - Keyboard dismiss when tapping outside inputs
 * - Navigation to sign-up for new users
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Keyboard } from 'react-native';
import SignInScreen from '../app/(auth)/sign-in';

// --- Clerk mock ---

const mockSignIn = {
  create: jest.fn().mockResolvedValue({
    status: 'needs_first_factor',
    supportedFirstFactors: [
      { strategy: 'phone_code', phoneNumberId: 'pn_test123' },
    ],
  }),
  prepareFirstFactor: jest.fn().mockResolvedValue({}),
  attemptFirstFactor: jest.fn().mockResolvedValue({
    status: 'complete',
    createdSessionId: 'sess_signin123',
  }),
  createdSessionId: null,
};
const mockSetActive = jest.fn().mockResolvedValue(undefined);

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    signIn: mockSignIn,
    setActive: mockSetActive,
    isLoaded: true,
  }),
}));

// --- Helpers ---

beforeEach(() => {
  jest.clearAllMocks();
  mockSignIn.create.mockResolvedValue({
    status: 'needs_first_factor',
    supportedFirstFactors: [
      { strategy: 'phone_code', phoneNumberId: 'pn_test123' },
    ],
  });
  mockSignIn.prepareFirstFactor.mockResolvedValue({});
  mockSignIn.attemptFirstFactor.mockResolvedValue({
    status: 'complete',
    createdSessionId: 'sess_signin123',
  });
});

// --- Tests ---

describe('Sign-In Flow', () => {
  it('should show Welcome Back and phone input on initial render', () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByPlaceholderText('Phone number (+1...)')).toBeTruthy();
    expect(getByText('Send Code')).toBeTruthy();
  });

  it('should complete full OTP sign-in flow (phone → code → session)', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    // Step 1: Enter phone and send code
    fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15551234567');
    await act(async () => { fireEvent.press(getByText('Send Code')); });

    await waitFor(() => {
      expect(mockSignIn.create).toHaveBeenCalledWith({ identifier: '+15551234567' });
      expect(mockSignIn.prepareFirstFactor).toHaveBeenCalledWith({
        strategy: 'phone_code',
        phoneNumberId: 'pn_test123',
      });
      expect(getByPlaceholderText('Verification code')).toBeTruthy();
    });

    // Step 2: Enter code and verify
    fireEvent.changeText(getByPlaceholderText('Verification code'), '123456');
    await act(async () => { fireEvent.press(getByText('Verify')); });

    await waitFor(() => {
      expect(mockSignIn.attemptFirstFactor).toHaveBeenCalledWith({
        strategy: 'phone_code',
        code: '123456',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_signin123' });
    });
  });

  it('should show user-friendly error when no account exists', async () => {
    mockSignIn.create.mockRejectedValue({
      errors: [{
        code: 'form_identifier_not_found',
        message: 'No account found',
      }],
    });

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15559999999');
    await act(async () => { fireEvent.press(getByText('Send Code')); });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'No account found with this phone number. Try signing up instead.',
      );
    });
  });

  it('should navigate to sign-up screen for new users', () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText("Don't have an account? Sign up"));

    const { useRouter } = require('expo-router');
    expect(useRouter().push).toHaveBeenCalledWith('/(auth)/sign-up');
  });

  it('should dismiss keyboard when tapping outside input fields', () => {
    const { getByText } = render(<SignInScreen />);
    // TouchableWithoutFeedback wraps screen with Keyboard.dismiss
    fireEvent.press(getByText('Welcome Back'));
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });

  it('should show the verification code sent-to message', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15551234567');
    await act(async () => { fireEvent.press(getByText('Send Code')); });

    await waitFor(() => {
      expect(getByText('Enter the code sent to +15551234567')).toBeTruthy();
    });
  });
});
