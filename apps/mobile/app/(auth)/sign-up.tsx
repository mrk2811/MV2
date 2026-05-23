import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

type SignUpStep = 'phone' | 'verify' | 'name';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [step, setStep] = useState<SignUpStep>('phone');
  const [loading, setLoading] = useState(false);

  const onSendCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ phoneNumber: phone });
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setStep('verify');
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> };
      const firstErr = clerkErr.errors?.[0];
      let message = 'Failed to send code';
      if (firstErr?.code === 'form_param_unknown') {
        message = 'Phone number sign-up is not enabled. Please enable it in the Clerk dashboard under User & Authentication > Phone Number.';
      } else if (firstErr?.longMessage || firstErr?.message) {
        message = firstErr.longMessage || firstErr.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, phone, signUp]);

  const activateSession = useCallback(async () => {
    const sessionId = signUp?.createdSessionId;
    if (sessionId && setActive) {
      await setActive({ session: sessionId });
    }
  }, [signUp, setActive]);

  const onVerifyCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptPhoneNumberVerification({ code });
      console.warn('[sign-up] verify result:', JSON.stringify({ status: result.status, sessionId: result.createdSessionId }));

      if (result.status === 'complete') {
        const sessionId = result.createdSessionId ?? signUp?.createdSessionId;
        if (sessionId) {
          await setActive({ session: sessionId });
        }
      } else if (result.status === 'missing_requirements') {
        setStep('name');
      } else {
        Alert.alert('Verification', `Unexpected status: ${result.status}. Please try again.`);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> };
      const firstErr = clerkErr.errors?.[0];
      let message = 'Invalid verification code';
      if (firstErr?.longMessage || firstErr?.message) {
        message = firstErr.longMessage || firstErr.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive]);

  const onSubmitName = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    try {
      const result = await signUp.update({ firstName, lastName });
      const resultAny = result as unknown as Record<string, unknown>;
      console.warn('[sign-up] update result:', JSON.stringify({
        status: result.status,
        sessionId: result.createdSessionId,
        missingFields: resultAny.missingFields,
        requiredFields: resultAny.requiredFields,
        unverifiedFields: resultAny.unverifiedFields,
        optionalFields: resultAny.optionalFields,
      }));

      const sessionId = result.createdSessionId ?? signUp.createdSessionId;
      if (result.status === 'complete' && sessionId) {
        await setActive({ session: sessionId });
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId as string });
      } else {
        const missing = (resultAny.missingFields as string[] | undefined) ?? [];
        const missingStr = missing.length > 0 ? `\nMissing fields: ${missing.join(', ')}` : '';
        Alert.alert(
          'Almost there',
          `Your Clerk project requires additional fields to complete sign-up (status: ${result.status}).${missingStr}\n\nTo simplify sign-up, go to Clerk Dashboard → Configure → Email, Phone, Username and set Name/Email to optional instead of required.`,
        );
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> };
      const firstErr = clerkErr.errors?.[0];
      let message = 'Failed to complete sign-up';
      if (firstErr?.longMessage || firstErr?.message) {
        message = firstErr.longMessage || firstErr.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, firstName, lastName, setActive]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.logo}>MV2</Text>
        <Text style={styles.title}>Create Account</Text>

        {step === 'phone' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone number (+1...)"
              placeholderTextColor="#555"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={onSendCode}
              disabled={loading || !phone}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'verify' && (
          <>
            <Text style={styles.subtitle}>
              Enter the code sent to {phone}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Verification code"
              placeholderTextColor="#555"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={onVerifyCode}
              disabled={loading || !code}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'name' && (
          <>
            <Text style={styles.subtitle}>
              Almost there! What's your name?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="#555"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={onSubmitName}
              disabled={loading || !firstName || !lastName}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F10',
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#888892',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2D',
  },
  button: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#E63946',
    textAlign: 'center',
    fontSize: 14,
  },
});
