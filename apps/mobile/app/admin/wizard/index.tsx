import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { WizardButton } from '../../../src/components/WizardButton';
import { InputField } from '../../../src/components/InputField';
import { api } from '../../../src/api/client';

const TOTAL_STEPS = 10;

const HEX_RE = /^#([0-9A-Fa-f]{3}){1,2}$/;
function safeColor(color: string, fallback = '#E63946'): string {
  return HEX_RE.test(color) ? color : fallback;
}

const COLOR_PALETTE = [
  '#E63946', '#FF6B6B', '#FF8C42', '#F4A261',
  '#E9C46A', '#2A9D8F', '#06D6A0', '#4ECDC4',
  '#3A86FF', '#6C63FF', '#8338EC', '#FF006E',
  '#1D3557', '#457B9D', '#A8DADC', '#264653',
];

const LAYOUT_OPTIONS = [
  { key: 'PROMPT_FIRST_FEED', label: 'Prompt-First Feed', desc: 'Swipe through rich profiles like dating apps' },
  { key: 'CURATED_MATCH_QUEUE', label: 'Curated Match Queue', desc: 'Get matched with recommended people' },
  { key: 'DISCORD_CHANNEL_MATRIX', label: 'Discord-Style Channels', desc: 'Browse organized topic channels' },
  { key: 'WHATSAPP_DIRECT_LIST', label: 'WhatsApp-Style List', desc: 'Chat-first with a clean message list' },
  { key: 'GRID_SINGLES_ROSTER', label: 'Grid Singles Roster', desc: 'Photo grid directory of members' },
];

// Pre-built static StyleSheet objects for each palette color (created once at module load)
const SWATCH_BG: Record<string, ViewStyle> = {};
COLOR_PALETTE.forEach((c) => {
  SWATCH_BG[c] = StyleSheet.create({ s: { backgroundColor: c } }).s;
});

const MOCKUP_DATA: Record<string, { icon: string; title: string; line1: string; line2: string; line3: string; ref: string }> = {
  PROMPT_FIRST_FEED: {
    icon: '👆',
    title: 'Swipe Cards',
    line1: 'Members see one profile at a time',
    line2: 'Pass or like with swipe gestures',
    line3: 'Bio, photo, and prompts on each card',
    ref: 'Similar to Hinge / Tinder',
  },
  CURATED_MATCH_QUEUE: {
    icon: '💘',
    title: 'Daily Matches',
    line1: 'Algorithm picks one match per day',
    line2: 'Shows compatibility score & shared interests',
    line3: 'Tap "Connect" to start a conversation',
    ref: 'Similar to Coffee Meets Bagel',
  },
  DISCORD_CHANNEL_MATRIX: {
    icon: '💬',
    title: 'Topic Channels',
    line1: '# general, # intros, # events, # photos',
    line2: 'Members post in organized channels',
    line3: 'Voice rooms for live group chats',
    ref: 'Similar to Discord / Slack',
  },
  WHATSAPP_DIRECT_LIST: {
    icon: '📱',
    title: 'Direct Messages',
    line1: 'Chat list with recent conversations',
    line2: 'See name, last message & timestamp',
    line3: 'Unread badges on new messages',
    ref: 'Similar to WhatsApp / iMessage',
  },
  GRID_SINGLES_ROSTER: {
    icon: '👥',
    title: 'Member Grid',
    line1: 'Photo grid of all app members',
    line2: 'Tap any profile to view details',
    line3: 'Filter & search by tags or location',
    ref: 'Similar to Instagram / Meetup',
  },
};

function LayoutMockup({ type }: { type: string }) {
  const d = MOCKUP_DATA[type];
  if (!d) return null;
  return (
    <View style={mck.card}>
      <Text style={mck.icon}>{d.icon}</Text>
      <Text style={mck.title}>{d.title}</Text>
      <View style={mck.divider} />
      <Text style={mck.line}>{d.line1}</Text>
      <Text style={mck.line}>{d.line2}</Text>
      <Text style={mck.line}>{d.line3}</Text>
      <View style={mck.divider} />
      <Text style={mck.ref}>{d.ref}</Text>
    </View>
  );
}

const mck = StyleSheet.create({
  card: { width: 200, alignSelf: 'center', backgroundColor: '#F5F5F7', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 18, borderWidth: 1, borderColor: '#E5E5EA' },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 10 },
  line: { fontSize: 12, color: '#3A3A3C', lineHeight: 18, marginBottom: 2 },
  ref: { fontSize: 11, color: '#8E8E93', fontStyle: 'italic', textAlign: 'center' },
});

const PRICING_OPTIONS = [
  { key: 'FREE', label: 'Free', desc: 'No charge — open access after approval' },
  { key: 'SUBSCRIPTION', label: 'Subscription', desc: 'Monthly fee for access ($9.99/mo default)' },
  { key: 'TOKEN', label: 'Token-Based', desc: 'Pay-per-action with token credits' },
];

interface WizardData {
  name: string;
  slug: string;
  description: string;
  adminPseudonym: string;
  geographicAnchor: string;
  logoUrl: string;
  accentColor: string;
  themeMode: string;
  layoutType: string;
  anchorLink: string;
  gatekeeperQuestions: string[];
  communityRules: string[];
  pricingType: string;
  subscriptionPrice: string;
  tokenCost: string;
  acceptsPassport: boolean;
  welcomeMessage: string;
  customTags: string[];
  matchmakerEnabled: boolean;
}

interface WizardDraft {
  id: string;
  currentStep: number;
  stepData: Record<string, unknown>;
}

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const draftId = useRef<string | null>(null);
  const [layoutIdx, setLayoutIdx] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: '',
    slug: '',
    description: '',
    adminPseudonym: '',
    geographicAnchor: '',
    logoUrl: '',
    accentColor: '#E63946',
    themeMode: 'DARK',
    layoutType: 'PROMPT_FIRST_FEED',
    anchorLink: '',
    gatekeeperQuestions: [''],
    communityRules: [''],
    pricingType: 'FREE',
    subscriptionPrice: '9.99',
    tokenCost: '5',
    acceptsPassport: false,
    welcomeMessage: '',
    customTags: [''],
    matchmakerEnabled: false,
  });

  const updateField = useCallback(
    <K extends keyof WizardData>(field: K, value: WizardData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const autoSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  useEffect(() => {
    api
      .post<WizardDraft>('/setup-wizard', {})
      .then((draft) => {
        draftId.current = draft.id;
        if (draft.currentStep > 1) {
          setStep(draft.currentStep);
        }
      })
      .catch(() => {});
  }, []);

  const saveStepToApi = useCallback(
    async (stepNum: number, stepData: Record<string, unknown>) => {
      if (!draftId.current) return;
      try {
        await api.patch(`/setup-wizard/${draftId.current}/step`, {
          step: stepNum,
          data: stepData,
        });
      } catch {
        // silent — local state is the source of truth during editing
      }
    },
    [],
  );

  const getStepData = useCallback(
    (stepNum: number): Record<string, unknown> => {
      switch (stepNum) {
        case 1:
          return { name: data.name, slug: data.slug, description: data.description };
        case 2:
          return { adminPseudonym: data.adminPseudonym };
        case 3:
          return { geographicAnchor: data.geographicAnchor, anchorLink: data.anchorLink };
        case 4:
          return { logoUrl: data.logoUrl, accentColor: data.accentColor, themeMode: data.themeMode };
        case 5:
          return { layoutType: data.layoutType };
        case 6:
          return { gatekeeperQuestions: data.gatekeeperQuestions.filter((q) => q.trim()) };
        case 7:
          return { communityRules: data.communityRules.filter((r) => r.trim()) };
        case 8:
          return {
            pricingType: data.pricingType,
            subscriptionPrice: data.pricingType === 'SUBSCRIPTION' ? parseFloat(data.subscriptionPrice) || 9.99 : undefined,
            tokenCost: data.pricingType === 'TOKEN' ? parseInt(data.tokenCost, 10) || 5 : undefined,
            acceptsPassport: data.acceptsPassport,
          };
        case 9:
          return {
            welcomeMessage: data.welcomeMessage,
            customTags: data.customTags.filter((t) => t.trim()),
            matchmakerEnabled: data.matchmakerEnabled,
          };
        default:
          return {};
      }
    },
    [data],
  );

  const nextStep = () => {
    saveStepToApi(step, getStepData(step));
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const ensureDraft = useCallback(async (): Promise<string | null> => {
    if (draftId.current) return draftId.current;
    try {
      const draft = await api.post<WizardDraft>('/setup-wizard', {});
      draftId.current = draft.id;
      return draft.id;
    } catch {
      return null;
    }
  }, []);

  const handleFinalize = async () => {
    if (!data.name || !data.slug) {
      Alert.alert('Missing Info', 'App name and slug are required.');
      return;
    }
    const resolvedDraftId = await ensureDraft();
    if (!resolvedDraftId) {
      Alert.alert('Error', 'Could not connect to server. Please check your connection and try again.');
      return;
    }
    setLoading(true);
    try {
      const questions = data.gatekeeperQuestions
        .filter((q) => q.trim())
        .map((text, i) => ({ id: `q${i + 1}`, text, type: 'FREE_TEXT' }));
      const rules = data.communityRules
        .filter((r) => r.trim())
        .map((text, i) => ({ id: `r${i + 1}`, text, order: i + 1 }));
      const tags = data.customTags
        .filter((t) => t.trim())
        .map((name) => ({ name }));

      await api.post(`/setup-wizard/${resolvedDraftId}/finalize`, {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        adminPseudonym: data.adminPseudonym || undefined,
        geographicAnchor: data.geographicAnchor || undefined,
        logoUrl: data.logoUrl || undefined,
        accentColor: data.accentColor,
        themeMode: data.themeMode,
        layoutType: data.layoutType,
        anchorLink: data.anchorLink || undefined,
        gatekeeperQuestions: questions,
        communityRules: rules,
        pricingType: data.pricingType,
        subscriptionPrice:
          data.pricingType === 'SUBSCRIPTION'
            ? parseFloat(data.subscriptionPrice) || 9.99
            : undefined,
        tokenCost:
          data.pricingType === 'TOKEN'
            ? parseInt(data.tokenCost, 10) || 5
            : undefined,
        acceptsPassport: data.acceptsPassport,
        welcomeMessage: data.welcomeMessage || undefined,
        customTags: tags,
        matchmakerEnabled: data.matchmakerEnabled,
      });

      Alert.alert('App Created!', `${data.name} is now live.`, [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create app';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateListItem = (
    field: 'gatekeeperQuestions' | 'communityRules' | 'customTags',
    index: number,
    value: string,
  ) => {
    const arr = [...data[field]];
    arr[index] = value;
    updateField(field, arr);
  };

  const addListItem = (
    field: 'gatekeeperQuestions' | 'communityRules' | 'customTags',
  ) => {
    updateField(field, [...data[field], '']);
  };

  const removeListItem = (
    field: 'gatekeeperQuestions' | 'communityRules' | 'customTags',
    index: number,
  ) => {
    const arr = data[field].filter((_, i) => i !== index);
    updateField(field, arr.length === 0 ? [''] : arr);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Name Your App</Text>
            <Text style={styles.stepDesc}>
              Choose a name for your app. This is what members will
              see.
            </Text>
            <InputField
              label="App Name"
              placeholder="e.g. Brooklyn Run Club Singles"
              value={data.name}
              onChangeText={(text) => {
                updateField('name', text);
                updateField('slug', autoSlug(text));
              }}
            />
            <InputField
              label="URL Slug"
              hint="Used for deep links: mv2.app/c/your-slug"
              placeholder="e.g. brooklyn-runners"
              value={data.slug}
              onChangeText={(text) => updateField('slug', autoSlug(text))}
              autoCapitalize="none"
            />
            <InputField
              label="Description"
              hint="Brief description of your app"
              placeholder="A singles app for Brooklyn runners..."
              value={data.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Your Admin Identity</Text>
            <Text style={styles.stepDesc}>
              Choose how you appear to members. You can use a pseudonym to stay
              anonymous.
            </Text>
            <InputField
              label="Admin Pseudonym"
              hint="Optional — how members will see you"
              placeholder="e.g. Coach Mike, The Matchmaker"
              value={data.adminPseudonym}
              onChangeText={(text) => updateField('adminPseudonym', text)}
            />
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Geographic Anchor</Text>
            <Text style={styles.stepDesc}>
              Where is your app based? This helps with local discovery.
            </Text>
            <InputField
              label="Location"
              placeholder="e.g. Brooklyn, NY"
              value={data.geographicAnchor}
              onChangeText={(text) => updateField('geographicAnchor', text)}
            />
            <InputField
              label="Anchor Link"
              hint="Optional — link to your existing group (WhatsApp, Discord, etc.)"
              placeholder="https://chat.whatsapp.com/..."
              value={data.anchorLink}
              onChangeText={(text) => updateField('anchorLink', text)}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        );

      case 4: {
        const isDark = data.themeMode === 'DARK';
        return (
          <View>
            <Text style={styles.stepTitle}>Branding</Text>
            <Text style={styles.stepDesc}>
              Customize how your app looks. Pick a logo, colors, and theme.
            </Text>

            {/* Logo Picker */}
            <Text style={styles.fieldLabel}>App Logo</Text>
            <Text style={styles.hint}>Tap to select from your photo library</Text>
            <TouchableOpacity
              style={styles.logoPicker}
              onPress={async () => {
                try {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets[0]) {
                    updateField('logoUrl', result.assets[0].uri);
                  }
                } catch {
                  Alert.alert('Error', 'Could not open photo library');
                }
              }}
            >
              {/* Both always in tree — display toggles visibility (iOS Fabric safe) */}
              <View style={data.logoUrl && data.logoUrl.length > 0 ? styles.visible : styles.hidden}>
                <Image source={{ uri: data.logoUrl || ' ' }} style={styles.logoImage} />
              </View>
              <View style={data.logoUrl && data.logoUrl.length > 0 ? styles.hidden : styles.visible}>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>+ Choose Logo</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={data.logoUrl && data.logoUrl.length > 0 ? styles.visible : styles.hidden}>
              <TouchableOpacity onPress={() => updateField('logoUrl', '')}>
                <Text style={styles.logoRemoveText}>Remove Logo</Text>
              </TouchableOpacity>
            </View>

            {/* Color Palette */}
            <Text style={styles.fieldLabelSpaced}>Accent Color</Text>
            <Text style={styles.hint}>Pick a color for your app brand</Text>
            <View style={styles.colorGrid}>
              {COLOR_PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  testID={`color-swatch-${color}`}
                  style={[
                    styles.colorSwatch,
                    SWATCH_BG[color],
                    data.accentColor === color ? styles.colorSwatchActive : styles.colorSwatchInactive,
                  ]}
                  onPress={() => updateField('accentColor', color)}
                >
                  <Text style={data.accentColor === color ? styles.colorCheck : styles.colorCheckHidden}>{'✓'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme Mode */}
            <Text style={styles.fieldLabelSpaced}>Theme Mode</Text>
            <Text style={styles.hint}>Choose light or dark mode for your app</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={data.themeMode === 'DARK' ? styles.optionChipActive : styles.optionChip}
                onPress={() => updateField('themeMode', 'DARK')}
              >
                <Text style={data.themeMode === 'DARK' ? styles.optionChipTextActive : styles.optionChipText}>
                  DARK
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={data.themeMode === 'LIGHT' ? styles.optionChipActive : styles.optionChip}
                onPress={() => updateField('themeMode', 'LIGHT')}
              >
                <Text style={data.themeMode === 'LIGHT' ? styles.optionChipTextActive : styles.optionChipText}>
                  LIGHT
                </Text>
              </TouchableOpacity>
            </View>

            {/* Theme Preview - simplified, no dynamic inline styles */}
            <View style={isDark ? styles.themePreviewDark : styles.themePreviewLight}>
              <View style={styles.themePreviewHeader}>
                <View style={data.logoUrl && data.logoUrl.length > 0 ? styles.visible : styles.hidden}>
                  <Image source={{ uri: data.logoUrl || ' ' }} style={styles.themePreviewLogo} />
                </View>
                <View style={data.logoUrl && data.logoUrl.length > 0 ? styles.hidden : styles.visible}>
                  <View style={styles.themePreviewLogoFallback} />
                </View>
                <Text style={isDark ? styles.themePreviewNameDark : styles.themePreviewNameLight}>
                  {data.name || 'App Name'}
                </Text>
              </View>
              <View style={styles.themePreviewBar} />
              <Text style={isDark ? styles.themePreviewDescDark : styles.themePreviewDescLight}>
                {data.description || 'Your app description will appear here'}
              </Text>
            </View>
          </View>
        );
      }

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Choose Your Layout</Text>
            <Text style={styles.stepDesc}>
              Browse layouts and tap Select to choose one.
            </Text>

            {/* All 5 cards always in tree; display toggles visibility */}
            {LAYOUT_OPTIONS.map((opt, i) => {
              const sel = data.layoutType === opt.key;
              const visible = i === layoutIdx;
              return (
                <View
                  key={opt.key}
                  style={visible
                    ? (sel ? styles.carouselCardSelected : styles.carouselCard)
                    : styles.carouselCardHidden}
                >
                  <View style={mck.card}>
                    <Text style={mck.icon}>{MOCKUP_DATA[opt.key]?.icon ?? ''}</Text>
                    <Text style={mck.title}>{MOCKUP_DATA[opt.key]?.title ?? ''}</Text>
                    <View style={mck.divider} />
                    <Text style={mck.line}>{MOCKUP_DATA[opt.key]?.line1 ?? ''}</Text>
                    <Text style={mck.line}>{MOCKUP_DATA[opt.key]?.line2 ?? ''}</Text>
                    <Text style={mck.line}>{MOCKUP_DATA[opt.key]?.line3 ?? ''}</Text>
                    <View style={mck.divider} />
                    <Text style={mck.ref}>{MOCKUP_DATA[opt.key]?.ref ?? ''}</Text>
                  </View>
                  <Text style={sel ? styles.carouselTitleSelected : styles.carouselTitle}>
                    {opt.label}
                  </Text>
                  <Text style={styles.carouselDesc}>{opt.desc}</Text>
                  <TouchableOpacity
                    style={sel ? styles.carouselSelectBtnActive : styles.carouselSelectBtn}
                    onPress={() => updateField('layoutType', opt.key)}
                  >
                    <Text style={sel ? styles.carouselSelectTextActive : styles.carouselSelectText}>
                      {sel ? 'Selected' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Navigation arrows */}
            <View style={styles.carouselNav}>
              <TouchableOpacity
                style={layoutIdx === 0 ? styles.carouselArrowDisabled : styles.carouselArrow}
                onPress={() => { if (layoutIdx > 0) setLayoutIdx(layoutIdx - 1); }}
                disabled={layoutIdx === 0}
              >
                <Text style={styles.carouselArrowText}>{'<'}</Text>
              </TouchableOpacity>

              <Text style={styles.carouselCounter}>
                {layoutIdx + 1} / {LAYOUT_OPTIONS.length}
              </Text>

              <TouchableOpacity
                style={layoutIdx === LAYOUT_OPTIONS.length - 1 ? styles.carouselArrowDisabled : styles.carouselArrow}
                onPress={() => { if (layoutIdx < LAYOUT_OPTIONS.length - 1) setLayoutIdx(layoutIdx + 1); }}
                disabled={layoutIdx === LAYOUT_OPTIONS.length - 1}
              >
                <Text style={styles.carouselArrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            {/* Dots */}
            <View style={styles.carouselDots}>
              {LAYOUT_OPTIONS.map((opt, i) => (
                <View
                  key={opt.key}
                  style={i === layoutIdx ? styles.carouselDotActive : styles.carouselDot}
                />
              ))}
            </View>
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.stepTitle}>Gatekeeper Questions</Text>
            <Text style={styles.stepDesc}>
              Questions applicants must answer to join. This is your doorbell.
            </Text>
            {data.gatekeeperQuestions.map((q, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listInputWrap}>
                  <InputField
                    label={`Question ${i + 1}`}
                    placeholder="e.g. What running club are you in?"
                    value={q}
                    onChangeText={(text) =>
                      updateListItem('gatekeeperQuestions', i, text)
                    }
                  />
                </View>
                {data.gatekeeperQuestions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeListItem('gatekeeperQuestions', i)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addListItem('gatekeeperQuestions')}
            >
              <Text style={styles.addBtnTextAccent}>
                + Add Question
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.stepTitle}>App Rules</Text>
            <Text style={styles.stepDesc}>
              Set ground rules for your members. These will be shown during
              onboarding.
            </Text>
            {data.communityRules.map((r, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listInputWrap}>
                  <InputField
                    label={`Rule ${i + 1}`}
                    placeholder="e.g. Be respectful and kind"
                    value={r}
                    onChangeText={(text) =>
                      updateListItem('communityRules', i, text)
                    }
                  />
                </View>
                {data.communityRules.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeListItem('communityRules', i)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addListItem('communityRules')}
            >
              <Text style={styles.addBtnTextAccent}>
                + Add Rule
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 8:
        return (
          <View>
            <Text style={styles.stepTitle}>Pricing Model</Text>
            <Text style={styles.stepDesc}>
              How will members pay? You can always change this later.
            </Text>
            {PRICING_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={data.pricingType === opt.key ? styles.layoutCardActive : styles.layoutCard}
                onPress={() => updateField('pricingType', opt.key)}
              >
                <Text style={data.pricingType === opt.key ? styles.layoutTitleActive : styles.layoutTitle}>
                  {opt.label}
                </Text>
                <Text style={styles.layoutDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
            <View style={data.pricingType === 'SUBSCRIPTION' ? styles.visible : styles.hidden}>
              <InputField
                label="Monthly Price ($)"
                placeholder="9.99"
                value={data.subscriptionPrice}
                onChangeText={(text) => updateField('subscriptionPrice', text)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={data.pricingType === 'TOKEN' ? styles.visible : styles.hidden}>
              <InputField
                label="Token Cost (per action)"
                placeholder="5"
                value={data.tokenCost}
                onChangeText={(text) => updateField('tokenCost', text)}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Accept All-Access Passport?</Text>
              <TouchableOpacity
                style={data.acceptsPassport ? styles.toggleActive : styles.toggle}
                onPress={() =>
                  updateField('acceptsPassport', !data.acceptsPassport)
                }
              >
                <Text style={styles.toggleText}>
                  {data.acceptsPassport ? 'YES' : 'NO'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 9:
        return (
          <View>
            <Text style={styles.stepTitle}>Welcome & Extras</Text>
            <Text style={styles.stepDesc}>
              Set a welcome message and optional features for your app.
            </Text>
            <InputField
              label="Welcome Message"
              hint="Shown to new members after they're approved"
              placeholder="Welcome to our app! Here are some tips..."
              value={data.welcomeMessage}
              onChangeText={(text) => updateField('welcomeMessage', text)}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.fieldLabel}>Custom Tags</Text>
            <Text style={styles.hint}>
              Tags members can use on their profiles (e.g. pace, distance, cuisine)
            </Text>
            {data.customTags.map((t, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listInputWrap}>
                  <InputField
                    label={`Tag ${i + 1}`}
                    placeholder="e.g. Pace, Distance"
                    value={t}
                    onChangeText={(text) =>
                      updateListItem('customTags', i, text)
                    }
                  />
                </View>
                {data.customTags.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeListItem('customTags', i)}
                  >
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addListItem('customTags')}
            >
              <Text style={styles.addBtnTextAccent}>
                + Add Tag
              </Text>
            </TouchableOpacity>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Matchmaker Mode?</Text>
              <TouchableOpacity
                style={data.matchmakerEnabled ? styles.toggleActive : styles.toggle}
                onPress={() =>
                  updateField('matchmakerEnabled', !data.matchmakerEnabled)
                }
              >
                <Text style={styles.toggleText}>
                  {data.matchmakerEnabled ? 'YES' : 'NO'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 10:
        return (
          <View>
            <Text style={styles.stepTitle}>Review & Launch</Text>
            <Text style={styles.stepDesc}>
              Everything looks good? Let's launch your app!
            </Text>
            <View style={styles.reviewSection}>
              <ReviewRow label="Name" value={data.name} />
              <ReviewRow label="Slug" value={data.slug} />
              <ReviewRow label="Description" value={data.description} />
              <ReviewRow label="Admin Name" value={data.adminPseudonym} />
              <ReviewRow label="Location" value={data.geographicAnchor} />
              <ReviewRow label="Theme" value={data.themeMode} />
              <ReviewRow label="Accent" value={data.accentColor} />
              <ReviewRow
                label="Layout"
                value={
                  LAYOUT_OPTIONS.find((l) => l.key === data.layoutType)?.label ??
                  data.layoutType
                }
              />
              <ReviewRow
                label="Pricing"
                value={
                  PRICING_OPTIONS.find((p) => p.key === data.pricingType)
                    ?.label ?? data.pricingType
                }
              />
              <ReviewRow
                label="Questions"
                value={`${data.gatekeeperQuestions.filter((q) => q.trim()).length} set`}
              />
              <ReviewRow
                label="Rules"
                value={`${data.communityRules.filter((r) => r.trim()).length} set`}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <StepIndicator
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        accentColor={safeColor(data.accentColor)}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
      >
        <View key={`step-${step}`}>
          {renderStep()}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {/* Back button always in tree — hide on step 1 via opacity to prevent tree mutation */}
        <View style={step > 1 ? styles.visible : styles.hiddenKeepLayout}>
          <WizardButton
            title="Back"
            variant="ghost"
            onPress={prevStep}
            disabled={step <= 1}
          />
        </View>
        <View style={styles.spacer} />
        {/* Both buttons always in tree — display toggles visibility (iOS Fabric safe) */}
        <View style={step < TOTAL_STEPS ? styles.visible : styles.hidden}>
          <WizardButton
            title="Next"
            accentColor={safeColor(data.accentColor)}
            onPress={nextStep}
          />
        </View>
        <View style={step < TOTAL_STEPS ? styles.hidden : styles.visible}>
          <WizardButton
            title="Launch Your App"
            accentColor={safeColor(data.accentColor)}
            onPress={handleFinalize}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  contentInner: { padding: 24, paddingBottom: 40 },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  stepDesc: { color: '#6B6B73', fontSize: 15, marginBottom: 24, lineHeight: 22 },
  fieldLabel: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldLabelSpaced: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 24,
  },
  hint: { color: '#6B6B73', fontSize: 13, marginBottom: 8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  spacer: { flex: 1 },
  optionRow: { flexDirection: 'row', marginBottom: 20 },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 12,
  },
  optionChipText: { color: '#6B6B73', fontSize: 14, fontWeight: '500' },
  optionChipActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E63946',
    backgroundColor: '#F5F5F7',
    marginRight: 12,
  },
  optionChipTextActive: { color: '#E63946', fontSize: 14, fontWeight: '500' },
  layoutCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  layoutCardActive: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E63946',
    backgroundColor: '#F5F5F7',
    marginBottom: 12,
  },
  layoutTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '600' },
  layoutTitleActive: { color: '#E63946', fontSize: 16, fontWeight: '600' },
  layoutDesc: { color: '#6B6B73', fontSize: 13, marginTop: 4 },
  layoutRef: { color: '#8E8E93', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  carouselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  carouselCardSelected: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E63946',
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  carouselCardHidden: {
    display: 'none',
  },
  carouselTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 12 },
  carouselTitleSelected: { fontSize: 18, fontWeight: '700', color: '#E63946', marginTop: 12 },
  carouselDesc: { fontSize: 13, color: '#6B6B73', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  carouselSelectBtn: {
    marginTop: 14,
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F5F5F7',
  },
  carouselSelectBtnActive: {
    marginTop: 14,
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E63946',
    backgroundColor: '#E63946',
  },
  carouselSelectText: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  carouselSelectTextActive: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  carouselNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  carouselArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  carouselArrowDisabled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  carouselArrowText: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  carouselCounter: { fontSize: 14, color: '#6B6B73', fontWeight: '600', marginLeft: 20, marginRight: 20 },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  carouselDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA', marginHorizontal: 3 },
  carouselDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E63946', marginHorizontal: 3 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start' },
  listInputWrap: { flex: 1 },
  removeBtn: {
    marginTop: 28,
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#E63946', fontSize: 18, fontWeight: '700' },
  addBtn: { paddingVertical: 12 },
  addBtnText: { fontSize: 15, fontWeight: '600' },
  addBtnTextAccent: { fontSize: 15, fontWeight: '600', color: '#E63946' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  toggleLabel: { color: '#1C1C1E', fontSize: 15 },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
  },
  toggleActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E63946',
  },
  toggleText: { color: '#1C1C1E', fontSize: 13, fontWeight: '600' },
  reviewSection: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  reviewLabel: { color: '#6B6B73', fontSize: 14 },
  reviewValue: { color: '#1C1C1E', fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  logoImage: { width: 96, height: 96, borderRadius: 14 },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  logoPlaceholderText: { fontSize: 14, color: '#6B6B73', fontWeight: '600' },
  logoRemoveText: { color: '#E63946', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  colorSwatchInactive: {
    borderWidth: 2,
    borderColor: '#F5F5F7',
  },
  colorSwatchActive: {
    borderColor: '#1C1C1E',
    borderWidth: 3,
  },
  colorCheck: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  themePreviewDark: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  themePreviewLight: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  themePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themePreviewLogo: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  themePreviewLogoFallback: { width: 36, height: 36, borderRadius: 8, marginRight: 10, backgroundColor: '#E63946' },
  themePreviewNameDark: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  themePreviewNameLight: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  themePreviewBar: { height: 4, borderRadius: 2, marginBottom: 10, backgroundColor: '#E63946' },
  themePreviewDescDark: { fontSize: 13, lineHeight: 18, color: '#8E8E93' },
  themePreviewDescLight: { fontSize: 13, lineHeight: 18, color: '#6B6B73' },
  visible: {},
  hidden: { display: 'none' },
  hiddenKeepLayout: { opacity: 0 },
  colorCheckHidden: { fontSize: 18, fontWeight: '700', color: 'transparent' },
});
