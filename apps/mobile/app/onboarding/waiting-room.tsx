import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WizardButton } from '../../src/components/WizardButton';
import { api } from '../../src/api/client';

interface OnboardingState {
  stage: string;
  tenant: {
    id: string;
    name: string;
    accentColor: string;
  };
  application: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

export default function WaitingRoom() {
  const router = useRouter();
  const { tenantId, slug } = useLocalSearchParams<{
    tenantId: string;
    slug: string;
  }>();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchState = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await api.get<OnboardingState>(
        `/onboarding/state/${tenantId}`,
      );
      setState(data);

      if (data.stage === 'PROFILE_SETUP') {
        router.replace(
          `/onboarding/profile-setup?tenantId=${tenantId}&slug=${slug}`,
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantId, slug, router]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchState();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  const accent = state?.tenant?.accentColor || '#E63946';
  const status = state?.application?.status || 'PENDING';
  const isRejected = status === 'REJECTED' || state?.stage === 'REJECTED';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent}
          />
        }
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{isRejected ? '🚫' : '⏳'}</Text>
        </View>

        <Text style={styles.title}>
          {isRejected ? 'Application Declined' : 'Waiting Room'}
        </Text>

        <Text style={styles.communityName}>
          {state?.tenant?.name || 'App'}
        </Text>

        <Text style={styles.desc}>
          {isRejected
            ? 'Unfortunately your application was not approved. You can contact the app admin for more info.'
            : 'Your application has been submitted! The app admin will review it soon. Pull down to refresh.'}
        </Text>

        {state?.application?.createdAt && (
          <Text style={styles.timestamp}>
            Applied{' '}
            {new Date(state.application.createdAt).toLocaleDateString()}
          </Text>
        )}

        <View
          style={[
            styles.statusBadge,
            isRejected
              ? styles.rejectedBadge
              : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isRejected ? styles.rejectedText : styles.pendingText,
            ]}
          >
            {status}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WizardButton
          title="Back to Hub"
          variant="secondary"
          onPress={() => router.replace('/onboarding/hub')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrap: { marginBottom: 20 },
  icon: { fontSize: 56 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  communityName: {
    fontSize: 16,
    color: '#6B6B73',
    marginBottom: 20,
  },
  desc: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 320,
  },
  timestamp: { color: '#8E8E93', fontSize: 13, marginBottom: 16 },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rejectedBadge: { backgroundColor: '#E6394620' },
  pendingBadge: { backgroundColor: '#E6394620' },
  statusText: { fontSize: 14, fontWeight: '600' },
  rejectedText: { color: '#E63946' },
  pendingText: { color: '#E63946' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
});
