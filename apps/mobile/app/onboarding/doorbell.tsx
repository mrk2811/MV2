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

interface TenantInfo {
  id: string;
  name: string;
  accentColor: string;
  gatekeeperQuestions: string[];
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
        questions.forEach((q, i) => {
          initial[`q${i}`] = '';
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
  const questions = Array.isArray(tenant?.gatekeeperQuestions)
    ? (tenant.gatekeeperQuestions as string[])
    : [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
          questions.map((question, i) => (
            <InputField
              key={i}
              label={String(question)}
              placeholder="Your answer..."
              value={answers[`q${i}`] || ''}
              onChangeText={(text) =>
                setAnswers((prev) => ({ ...prev, [`q${i}`]: text }))
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
  container: { flex: 1, backgroundColor: '#0F0F10' },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888892', marginBottom: 28, lineHeight: 22 },
  noQuestions: {
    backgroundColor: '#1A1A1D',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noQuestionsText: { color: '#AAAAAA', fontSize: 15 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1D',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F0F10',
  },
  spacer: { flex: 1 },
});
