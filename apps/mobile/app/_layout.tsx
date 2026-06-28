import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../src/auth/token-cache';
import { setTokenProvider, api } from '../src/api/client';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// ── Debug heartbeat (prints every 15s so we can see the last log before a crash) ──
let _heartbeatSeq = 0;
setInterval(() => {
  _heartbeatSeq++;
  console.log(`[heartbeat] #${_heartbeatSeq} alive at ${new Date().toISOString()}`);
}, 15_000);

// Global unhandled JS error / rejection handlers
const _origHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log(`[CRASH-DEBUG] global error (fatal=${isFatal}):`, error?.message, error?.stack?.slice(0, 300));
  _origHandler(error, isFatal);
});

AppState.addEventListener('change', (state) => {
  console.log(`[DEBUG] AppState → ${state}`);
});

function TokenSync() {
  const { getToken, isSignedIn } = useAuth();
  const syncedRef = useRef(false);
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[DEBUG] TokenSync render #${renderCount.current}, isSignedIn=${isSignedIn}`);

  useEffect(() => {
    console.log('[DEBUG] TokenSync: setTokenProvider effect fired');
    setTokenProvider(() => getToken());
  }, [getToken]);

  // Only sync once on sign-in, not on every token refresh
  useEffect(() => {
    console.log(`[DEBUG] TokenSync: isSignedIn effect fired, isSignedIn=${isSignedIn}`);
    if (isSignedIn && !syncedRef.current) {
      syncedRef.current = true;
      api.post('/auth/sync', {}).catch(() => {});
    }
    if (!isSignedIn) {
      syncedRef.current = false;
    }
  }, [isSignedIn]);

  return null;
}

function AuthGate() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // Track last auth state to avoid re-running on token refresh re-renders
  const prevSignedIn = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    // Only act when isSignedIn actually changes value
    if (isSignedIn === prevSignedIn.current) return;
    prevSignedIn.current = isSignedIn;

    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded]);

  return (
    <>
      <TokenSync />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
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
