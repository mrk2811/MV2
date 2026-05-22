import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../src/auth/token-cache';
import { setTokenProvider, api } from '../src/api/client';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

function TokenSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn) {
      api.post('/auth/sync', {}).catch(() => {});
    }
  }, [isSignedIn]);

  return null;
}

function AuthGate() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  return (
    <>
      <TokenSync />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F10' },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthGate />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
