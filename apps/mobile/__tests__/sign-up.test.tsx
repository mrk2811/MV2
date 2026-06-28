/**
 * Sign-Up Flow Tests
 *
 * Covers all sign-up issues discovered during development:
 * - Phone → OTP → Verify → Profile (name + optional email/password) → Home
 * - Profile step always shown after OTP (even when Clerk returns 'complete')
 * - Keyboard dismiss when tapping outside inputs
 * - Error handling for Clerk errors
 * - Optional email/password fields
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Keyboard } from 'react-native';
import SignUpScreen from '../app/(auth)/sign-up';

// --- Clerk mock ---

const mockSignUp = {
  create: jest.fn().mockResolvedValue({}),
  preparePhoneNumberVerification: jest.fn().mockResolvedValue({}),
  attemptPhoneNumberVerification: jest.fn().mockResolvedValue({
    status: 'missing_requirements',
    createdSessionId: null,
  }),
  update: jest.fn().mockResolvedValue({
    status: 'complete',
    createdSessionId: 'sess_test123',
  }),
  createdSessionId: null,
};
const mockSetActive = jest.fn().mockResolvedValue(undefined);

jest.mock('@clerk/clerk-expo', () => ({
  useSignUp: () => ({
    signUp: mockSignUp,
    setActive: mockSetActive,
    isLoaded: true,
  }),
}));

// --- Helpers ---

beforeEach(() => {
  jest.clearAllMocks();
  mockSignUp.create.mockResolvedValue({});
  mockSignUp.preparePhoneNumberVerification.mockResolvedValue({});
  mockSignUp.attemptPhoneNumberVerification.mockResolvedValue({
    status: 'missing_requirements',
    createdSessionId: null,
  });
  mockSignUp.update.mockResolvedValue({
    status: 'complete',
    createdSessionId: 'sess_test123',
  });
});

/** Navigate through phone + verify steps to reach the profile step */
async function navigateToProfileStep(
  getByPlaceholderText: ReturnType<typeof render>['getByPlaceholderText'],
  getByText: ReturnType<typeof render>['getByText'],
) {
  fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15551234567');
  await act(async () => { fireEvent.press(getByText('Send Code')); });
  await waitFor(() => expect(getByPlaceholderText('Verification code')).toBeTruthy());
  fireEvent.changeText(getByPlaceholderText('Verification code'), '123456');
  await act(async () => { fireEvent.press(getByText('Verify')); });
  await waitFor(() => expect(getByText('Complete your profile')).toBeTruthy());
}

// --- Tests ---

describe('Sign-Up Flow', () => {
  it('should show phone input on initial render', () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByPlaceholderText('Phone number (+1...)')).toBeTruthy();
    expect(getByText('Send Code')).toBeTruthy();
  });

  it('should transition to verify step after sending code', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15551234567');
    await act(async () => { fireEvent.press(getByText('Send Code')); });

    await waitFor(() => {
      expect(mockSignUp.create).toHaveBeenCalledWith({ phoneNumber: '+15551234567' });
      expect(mockSignUp.preparePhoneNumberVerification).toHaveBeenCalledWith({ strategy: 'phone_code' });
      expect(getByPlaceholderText('Verification code')).toBeTruthy();
    });
  });

  it('should always show profile step after OTP (missing_requirements)', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    await navigateToProfileStep(getByPlaceholderText, getByText);

    expect(getByPlaceholderText('First name')).toBeTruthy();
    expect(getByPlaceholderText('Last name')).toBeTruthy();
    expect(getByPlaceholderText('Email (optional)')).toBeTruthy();
    expect(getByPlaceholderText('Password (optional)')).toBeTruthy();
  });

  it('should always show profile step even when Clerk returns complete (bug fix)', async () => {
    // BUG: When email+password were made optional in Clerk, Clerk started
    // returning status='complete' immediately after OTP. The old code skipped
    // the profile step in this case. This test ensures we always show it.
    mockSignUp.attemptPhoneNumberVerification.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_early123',
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    await navigateToProfileStep(getByPlaceholderText, getByText);

    // Profile step should STILL be shown, NOT skipped
    expect(getByPlaceholderText('First name')).toBeTruthy();
    // setActive should NOT have been called yet (session activates after profile)
    expect(mockSetActive).not.toHaveBeenCalled();
  });

  it('should show email and password as optional fields', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    await navigateToProfileStep(getByPlaceholderText, getByText);

    expect(getByPlaceholderText('Email (optional)')).toBeTruthy();
    expect(getByPlaceholderText('Password (optional)')).toBeTruthy();
  });

  it('should complete sign-up with only name (skip optional fields)', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    await navigateToProfileStep(getByPlaceholderText, getByText);

    fireEvent.changeText(getByPlaceholderText('First name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last name'), 'Doe');
    await act(async () => { fireEvent.press(getByText('Continue')); });

    await waitFor(() => {
      expect(mockSignUp.update).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_test123' });
    });
  });

  it('should complete sign-up with name + optional email + password', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    await navigateToProfileStep(getByPlaceholderText, getByText);

    fireEvent.changeText(getByPlaceholderText('First name'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Last name'), 'Smith');
    fireEvent.changeText(getByPlaceholderText('Email (optional)'), 'jane@example.com');
    fireEvent.changeText(getByPlaceholderText('Password (optional)'), 'SecurePass123');
    await act(async () => { fireEvent.press(getByText('Continue')); });

    await waitFor(() => {
      expect(mockSignUp.update).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        emailAddress: 'jane@example.com',
        password: 'SecurePass123',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_test123' });
    });
  });

  it('should show descriptive error when phone sign-up is not enabled', async () => {
    mockSignUp.create.mockRejectedValue({
      errors: [{
        code: 'form_param_unknown',
        message: 'phone_number is not a valid parameter',
      }],
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('Phone number (+1...)'), '+15551234567');
    await act(async () => { fireEvent.press(getByText('Send Code')); });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining('Phone number sign-up is not enabled'),
      );
    });
  });

  it('should navigate to sign-in screen for existing users', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('Already have an account? Sign in'));

    const { useRouter } = require('expo-router');
    expect(useRouter().push).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('should dismiss keyboard when tapping outside input fields', () => {
    const { getByText } = render(<SignUpScreen />);
    // The TouchableWithoutFeedback wraps the whole screen with Keyboard.dismiss
    fireEvent.press(getByText('Create Account'));
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });
});
