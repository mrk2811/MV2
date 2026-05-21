import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WizardButton } from '../src/components/WizardButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.logo}>MV2</Text>
      <Text style={styles.tagline}>Your communities. Your dating pools.</Text>

      <View style={styles.actions}>
        <WizardButton
          title="Discover Communities"
          accentColor="#E63946"
          onPress={() => router.push('/onboarding/hub')}
        />
        <View style={styles.gap} />
        <WizardButton
          title="Create a Community"
          variant="secondary"
          onPress={() => router.push('/admin/wizard')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#888892',
    marginTop: 12,
  },
  actions: {
    marginTop: 48,
    width: '100%',
    maxWidth: 320,
  },
  gap: { height: 12 },
});
