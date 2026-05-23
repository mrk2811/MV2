import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WizardButton } from '../../src/components/WizardButton';
import { InputField } from '../../src/components/InputField';
import { api } from '../../src/api/client';

interface GatekeeperQuestion {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

interface TenantInfo {
  id: string;
  name: string;
  accentColor: string;
  gatekeeperQuestions: Array<GatekeeperQuestion | string>;
}

export default function DoorbellScreen() {
  const router = useRouter();
  const { tenantId, slug } = useLocalSearchParams<{
    tenantId: string;
    slug: string;
  }>();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<TenantInfo>(`/tenants/${slug}`)
      .then((data) => {
        setTenant(data);
        const questions = Array.isArray(data.gatekeeperQuestions)
          ? data.gatekeeperQuestions
          : [];
        const initial: Record<string, string> = {};
        questions.forEach((q) => {
          const key = typeof q === 'string' ? q : q.id;
          initial[key] = '';
        });
        setAnswers(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async () => {
    if (!tenantId) return;
    setSubmitting(true);
    try {
      await api.post('/applications', {
        tenantId,
        answers,
      });
      router.replace(`/onboarding/waiting-room?tenantId=${tenantId}&slug=${slug}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit application';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  const accent = tenant?.accentColor || '#E63946';
  const rawQuestions = Array.isArray(tenant?.gatekeeperQuestions)
    ? tenant.gatekeeperQuestions
    : [];
  const questions = rawQuestions.map((q) => ({
    key: typeof q === 'string' ? q : q.id,
    label: typeof q === 'string' ? q : q.text,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Ring the Doorbell</Text>
        <Text style={styles.subtitle}>
          Answer these questions to apply for{' '}
          <Text style={{ color: accent }}>{tenant?.name}</Text>
        </Text>

        {questions.length === 0 ? (
          <View style={styles.noQuestions}>
            <Text style={styles.noQuestionsText}>
              No questions required — just tap submit to apply!
            </Text>
          </View>
        ) : (
          questions.map((q) => (
            <InputField
              key={q.key}
              label={q.label}
              placeholder="Your answer..."
              value={answers[q.key] || ''}
              onChangeText={(text) =>
                setAnswers((prev) => ({ ...prev, [q.key]: text }))
              }
              multiline
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <WizardButton
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
        />
        <View style={styles.spacer} />
        <WizardButton
          title="Submit Application"
          accentColor={accent}
          onPress={handleSubmit}
          loading={submitting}
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
  content: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B6B73', marginBottom: 28, lineHeight: 22 },
  noQuestions: {
    backgroundColor: '#F5F5F7',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noQuestionsText: { color: '#8E8E93', fontSize: 15 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  spacer: { flex: 1 },
});
