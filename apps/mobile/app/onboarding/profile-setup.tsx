import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WizardButton } from '../../src/components/WizardButton';
import { InputField } from '../../src/components/InputField';
import { api } from '../../src/api/client';

export default function ProfileSetup() {
  const router = useRouter();
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    age: '',
    bio: '',
    prompt1Question: 'My ideal date is...',
    prompt1Answer: '',
    prompt2Question: 'I value most in a partner...',
    prompt2Answer: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.displayName.trim()) {
      Alert.alert('Required', 'Please enter a display name.');
      return;
    }
    if (!tenantId) return;

    setSubmitting(true);
    try {
      const prompts = [];
      if (form.prompt1Answer.trim()) {
        prompts.push({
          question: form.prompt1Question,
          answer: form.prompt1Answer,
        });
      }
      if (form.prompt2Answer.trim()) {
        prompts.push({
          question: form.prompt2Question,
          answer: form.prompt2Answer,
        });
      }

      await api.post('/profiles', {
        tenantId,
        displayName: form.displayName,
        age: form.age ? parseInt(form.age, 10) : undefined,
        bio: form.bio || undefined,
        prompts,
      });

      Alert.alert('Profile Created!', 'You are now a member of this app.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create profile';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>
          Create your local profile for this app. This is how other members
          will see you.
        </Text>

        <InputField
          label="Display Name"
          placeholder="e.g. Sarah M."
          value={form.displayName}
          onChangeText={(text) => updateForm('displayName', text)}
        />

        <InputField
          label="Age"
          placeholder="e.g. 27"
          value={form.age}
          onChangeText={(text) => updateForm('age', text)}
          keyboardType="number-pad"
        />

        <InputField
          label="Bio"
          hint="A short intro about yourself"
          placeholder="Sunset runner & dog mom..."
          value={form.bio}
          onChangeText={(text) => updateForm('bio', text)}
          multiline
          numberOfLines={3}
        />

        <View style={styles.promptSection}>
          <Text style={styles.promptTitle}>Profile Prompts</Text>
          <Text style={styles.promptHint}>
            Answer prompts to help others get to know you
          </Text>

          <View style={styles.promptCard}>
            <InputField
              label="Prompt 1"
              value={form.prompt1Question}
              onChangeText={(text) => updateForm('prompt1Question', text)}
            />
            <InputField
              label="Your Answer"
              placeholder="Type your answer..."
              value={form.prompt1Answer}
              onChangeText={(text) => updateForm('prompt1Answer', text)}
              multiline
            />
          </View>

          <View style={styles.promptCard}>
            <InputField
              label="Prompt 2"
              value={form.prompt2Question}
              onChangeText={(text) => updateForm('prompt2Question', text)}
            />
            <InputField
              label="Your Answer"
              placeholder="Type your answer..."
              value={form.prompt2Answer}
              onChangeText={(text) => updateForm('prompt2Answer', text)}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WizardButton
          title="Create Profile"
          accentColor="#E63946"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!form.displayName.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: '#6B6B73',
    marginBottom: 28,
    lineHeight: 22,
  },
  promptSection: { marginTop: 8 },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  promptHint: { color: '#6B6B73', fontSize: 13, marginBottom: 16 },
  promptCard: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
});
