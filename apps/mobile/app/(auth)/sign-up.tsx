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

type SignUpStep = 'phone' | 'verify' | 'profile';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      // Always show profile step so user can enter name + optional email/password
      setStep('profile');
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

  const onSubmitProfile = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    try {
      const updateData: Record<string, string> = { firstName, lastName };
      if (email.trim()) updateData.emailAddress = email.trim();
      if (password) updateData.password = password;

      const result = await signUp.update(updateData);
      const sessionId = result.createdSessionId ?? signUp.createdSessionId;

      if (result.status === 'complete' && sessionId) {
        await setActive({ session: sessionId });
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId as string });
      } else {
        const resultAny = result as unknown as Record<string, unknown>;
        const missing = (resultAny.missingFields as string[] | undefined) ?? [];
        const missingStr = missing.length > 0 ? ` (${missing.join(', ')})` : '';
        Alert.alert('Almost there', `Additional fields still required${missingStr}. Please fill in all fields and try again.`);
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
  }, [isLoaded, signUp, firstName, lastName, email, password, setActive]);

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
              placeholderTextColor="#8E8E93"
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
              placeholderTextColor="#8E8E93"
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

        {step === 'profile' && (
          <ScrollView style={styles.scrollInner} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>
              Complete your profile
            </Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="#8E8E93"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="#8E8E93"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (optional)"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={onSubmitProfile}
              disabled={loading || !firstName || !lastName}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  scrollInner: {
    flexGrow: 0,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B73',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    color: '#1C1C1E',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
