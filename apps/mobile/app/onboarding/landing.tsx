import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WizardButton } from '../../src/components/WizardButton';
import { api } from '../../src/api/client';

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  accentColor: string;
  geographicAnchor: string | null;
  pricingType: string;
  welcomeMessage: string | null;
  layoutType: string;
  communityRules: unknown[];
  _count?: { memberships: number };
}

export default function LandingPage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api
      .get<TenantDetail>(`/tenants/${slug}`)
      .then(setTenant)
      .catch(() => setError('Community not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (error || !tenant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Community not found'}</Text>
        <WizardButton
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const accent = tenant.accentColor || '#E63946';
  const rules = Array.isArray(tenant.communityRules)
    ? (tenant.communityRules as string[])
    : [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroBanner, { backgroundColor: accent + '20' }]}>
          <View style={[styles.heroAccent, { backgroundColor: accent }]} />
          <Text style={styles.heroName}>{tenant.name}</Text>
          {tenant.geographicAnchor && (
            <Text style={styles.heroLocation}>{tenant.geographicAnchor}</Text>
          )}
        </View>

        {tenant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{tenant.description}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <InfoChip label="Layout" value={formatLayout(tenant.layoutType)} />
          <InfoChip label="Pricing" value={tenant.pricingType} />
        </View>

        {rules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Rules</Text>
            {rules.map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Text style={[styles.ruleBullet, { color: accent }]}>
                  {i + 1}.
                </Text>
                <Text style={styles.ruleText}>{String(rule)}</Text>
              </View>
            ))}
          </View>
        )}

        {tenant.welcomeMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welcome</Text>
            <Text style={styles.sectionText}>{tenant.welcomeMessage}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <WizardButton
          title="Apply to Join"
          accentColor={accent}
          onPress={() =>
            router.push(`/onboarding/doorbell?tenantId=${tenant.id}&slug=${tenant.slug}`)
          }
        />
      </View>
    </View>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function formatLayout(type: string): string {
  const map: Record<string, string> = {
    PROMPT_FIRST_FEED: 'Prompt Feed',
    CURATED_MATCH_QUEUE: 'Match Queue',
    DISCORD_CHANNEL_MATRIX: 'Channels',
    WHATSAPP_DIRECT_LIST: 'Direct List',
    GRID_SINGLES_ROSTER: 'Grid Roster',
  };
  return map[type] || type;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F10' },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: { color: '#E63946', fontSize: 16 },
  content: { paddingBottom: 100 },
  heroBanner: {
    padding: 32,
    paddingTop: 70,
    alignItems: 'center',
    position: 'relative',
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroLocation: {
    fontSize: 14,
    color: '#888892',
    marginTop: 6,
  },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionText: { fontSize: 15, color: '#AAAAAA', lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  chip: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  chipLabel: { color: '#888892', fontSize: 12, marginBottom: 4 },
  chipValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  ruleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  ruleBullet: { fontSize: 14, fontWeight: '600', marginRight: 8, width: 20 },
  ruleText: { flex: 1, color: '#AAAAAA', fontSize: 14, lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0F0F10',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1D',
  },
});
