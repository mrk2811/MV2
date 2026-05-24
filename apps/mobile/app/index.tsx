import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { WizardButton } from '../src/components/WizardButton';

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const displayName = user?.firstName || user?.phoneNumbers?.[0]?.phoneNumber || 'Member';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.userRow}>
        <Text style={styles.greeting}>Hey, {displayName}</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.logo}>MV2</Text>
        <Text style={styles.tagline}>Your apps. Your dating pools.</Text>
      </View>

      <View style={styles.actions}>
        <WizardButton
          title="Discover Apps"
          accentColor="#E63946"
          onPress={() => router.push('/onboarding/hub')}
        />
        <View style={styles.gap} />
        <WizardButton
          title="Create Your App"
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  userRow: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#6B6B73',
    fontSize: 14,
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  signOutText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#6B6B73',
    marginTop: 12,
  },
  actions: {
    marginTop: 48,
    width: '100%',
    maxWidth: 320,
  },
  gap: { height: 12 },
});
