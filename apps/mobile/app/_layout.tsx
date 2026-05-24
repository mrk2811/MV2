import { useEffect, Component, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../src/auth/token-cache';
import { setTokenProvider, api } from '../src/api/client';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Sentry is completely disabled in dev (Expo Go). Just importing @sentry/react-native
// triggers background native timers that crash the app every ~60s in Expo Go.
// Only require + initialize in production EAS builds.
let Sentry: { init: (opts: Record<string, unknown>) => void; captureException: (e: unknown, ctx?: unknown) => void } | null = null;
if (SENTRY_DSN && !__DEV__) {
  Sentry = require('@sentry/react-native');
  Sentry!.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableNativeFramesTracking: true,
    enableAutoSessionTracking: true,
    attachStacktrace: true,
  });
}

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
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
    </>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry?.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }
  componentDidMount() {
    this.sub = AppState.addEventListener('change', this.onAppState);
  }
  componentWillUnmount() {
    this.sub?.remove();
  }
  private sub: ReturnType<typeof AppState.addEventListener> | null = null;
  private onAppState = (state: AppStateStatus) => {
    if (state === 'active' && this.state.hasError) {
      this.setState({ hasError: false });
    }
  };
  render() {
    if (this.state.hasError) {
      this.setState({ hasError: false });
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <AuthGate />
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
