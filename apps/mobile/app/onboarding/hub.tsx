import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { api } from '../../src/api/client';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  accentColor: string;
  geographicAnchor: string | null;
  layoutType: string;
  pricingType: string;
  _count: { memberships: number };
}

export default function MomentumHub() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommunities = async () => {
    try {
      const data = await api.get<Community[]>('/onboarding/discover');
      setCommunities(data);
    } catch {
      // Fall back to public listing
      try {
        const data = await api.get<Community[]>('/tenants');
        setCommunities(data as Community[]);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.logo}>MV2</Text>
        <Text style={styles.title}>Momentum Hub</Text>
        <Text style={styles.subtitle}>Discover communities near you</Text>
      </View>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E63946"
          />
        }
      >
        {communities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Communities Yet</Text>
            <Text style={styles.emptyDesc}>
              Communities will appear here as admins create them.
            </Text>
          </View>
        ) : (
          communities.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push(`/onboarding/landing?slug=${c.slug}`)
              }
            >
              <View
                style={[styles.cardAccent, { backgroundColor: c.accentColor }]}
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{c.name}</Text>
                {c.geographicAnchor && (
                  <Text style={styles.cardLocation}>{c.geographicAnchor}</Text>
                )}
                {c.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {c.description}
                  </Text>
                )}
                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText}>
                    {c._count?.memberships ?? 0} members
                  </Text>
                  <Text style={styles.cardMetaDot}> · </Text>
                  <Text style={styles.cardMetaText}>{c.pricingType}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E63946',
    letterSpacing: 2,
    marginBottom: 16,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: '#888892', marginTop: 4 },
  list: { flex: 1 },
  listContent: { padding: 24, paddingTop: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1D',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  cardLocation: { fontSize: 13, color: '#888892', marginTop: 2 },
  cardDesc: { fontSize: 14, color: '#AAAAAA', marginTop: 8, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cardMetaText: { color: '#666', fontSize: 13 },
  cardMetaDot: { color: '#444', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  emptyDesc: { color: '#888892', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
