import { useEffect, Component, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as Sentry from '@sentry/react-native';
import { tokenCache } from '../src/auth/token-cache';
import { setTokenProvider, api } from '../src/api/client';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0,
    enableNativeFramesTracking: false,
    enableAutoSessionTracking: false,
    attachStacktrace: true,
    debug: __DEV__,
    integrations: (defaults) =>
      defaults.filter(
        (i) =>
          i.name !== 'StallTracking' &&
          i.name !== 'ReactNativeTracing' &&
          i.name !== 'TimeToDisplay',
      ),
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
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
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
