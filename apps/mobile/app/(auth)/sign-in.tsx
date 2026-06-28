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
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSendCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: phone,
      });

      const phoneCodeFactor = result.supportedFirstFactors?.find(
        (f) => f.strategy === 'phone_code',
      );

      if (phoneCodeFactor && 'phoneNumberId' in phoneCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });
        setPendingVerification(true);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> };
      const firstErr = clerkErr.errors?.[0];
      let message = 'Failed to send code';
      if (firstErr?.code === 'form_identifier_not_found') {
        message = 'No account found with this phone number. Try signing up instead.';
      } else if (firstErr?.longMessage || firstErr?.message) {
        message = firstErr.longMessage || firstErr.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, phone, signIn]);

  const onVerifyCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code,
      });
      const sessionId = result.createdSessionId ?? signIn?.createdSessionId;

      if (result.status === 'complete' && sessionId) {
        await setActive({ session: sessionId });
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId as string });
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
  }, [isLoaded, code, signIn, setActive]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.logo}>MV2</Text>
        <Text style={styles.title}>Welcome Back</Text>

        {!pendingVerification ? (
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
        ) : (
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

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
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
