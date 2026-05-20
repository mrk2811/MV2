import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSendCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ phoneNumber: phone });
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to send code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, phone, signUp]);

  const onVerifyCode = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptPhoneNumberVerification({ code });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid verification code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MV2</Text>
      <Text style={styles.title}>Create Account</Text>

      {!pendingVerification ? (
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
      ) : (
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

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
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
