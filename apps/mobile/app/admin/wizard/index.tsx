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
  { key: 'PROMPT_FIRST_FEED', label: 'Prompt-First Feed', desc: 'Content-rich profiles with card-swipe navigation' },
  { key: 'CURATED_MATCH_QUEUE', label: 'Curated Match Queue', desc: 'Recommendation-driven guided matchmaking' },
  { key: 'DISCORD_CHANNEL_MATRIX', label: 'Discord-Style Channels', desc: 'Categorized list hubs for directory separation' },
  { key: 'WHATSAPP_DIRECT_LIST', label: 'WhatsApp-Style List', desc: 'Streamlined chat-first interface' },
  { key: 'GRID_SINGLES_ROSTER', label: 'Grid Singles Roster', desc: 'High-density photo directory grid' },
];

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

  const handleFinalize = async () => {
    if (!data.name || !data.slug) {
      Alert.alert('Missing Info', 'Community name and slug are required.');
      return;
    }
    if (!draftId.current) {
      Alert.alert('Error', 'No draft found. Please restart the wizard.');
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

      await api.post(`/setup-wizard/${draftId.current}/finalize`, {
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

      Alert.alert('Community Created!', `${data.name} is now live.`, [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create community';
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
            <Text style={styles.stepTitle}>Name Your Community</Text>
            <Text style={styles.stepDesc}>
              Choose a name that represents your group. This is what members will
              see.
            </Text>
            <InputField
              label="Community Name"
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
              hint="Brief description of your community"
              placeholder="A singles community for Brooklyn runners..."
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
              Where is your community based? This helps with local discovery.
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

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Branding</Text>
            <Text style={styles.stepDesc}>
              Customize how your community looks. Pick a logo, colors, and theme.
            </Text>

            {/* Logo Picker */}
            <Text style={styles.fieldLabel}>Community Logo</Text>
            <Text style={styles.hint}>Tap to select from your photo library</Text>
            <TouchableOpacity
              style={styles.logoPicker}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                if (!result.canceled && result.assets[0]) {
                  updateField('logoUrl', result.assets[0].uri);
                }
              }}
            >
              {data.logoUrl ? (
                <Image source={{ uri: data.logoUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderIcon}>📷</Text>
                  <Text style={styles.logoPlaceholderText}>Choose Logo</Text>
                </View>
              )}
            </TouchableOpacity>
            {data.logoUrl ? (
              <TouchableOpacity onPress={() => updateField('logoUrl', '')}>
                <Text style={styles.logoRemoveText}>Remove Logo</Text>
              </TouchableOpacity>
            ) : null}

            {/* Color Palette */}
            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Accent Color</Text>
            <Text style={styles.hint}>Pick a color for your community brand</Text>
            <View style={styles.colorGrid}>
              {COLOR_PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  testID={`color-swatch-${color}`}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    data.accentColor === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => updateField('accentColor', color)}
                >
                  {data.accentColor === color && (
                    <Text style={styles.colorCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme Mode with Live Preview */}
            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Theme Mode</Text>
            <Text style={styles.hint}>Pick a theme — see a live preview below</Text>
            <View style={styles.optionRow}>
              {(['DARK', 'LIGHT'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.optionChip,
                    data.themeMode === mode && {
                      borderColor: safeColor(data.accentColor),
                      backgroundColor: safeColor(data.accentColor) + '20',
                    },
                  ]}
                  onPress={() => updateField('themeMode', mode)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      data.themeMode === mode && { color: safeColor(data.accentColor) },
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Theme Preview */}
            <View
              style={[
                styles.themePreview,
                {
                  backgroundColor: data.themeMode === 'DARK' ? '#1C1C1E' : '#FFFFFF',
                  borderColor: data.themeMode === 'DARK' ? '#2C2C2E' : '#E5E5EA',
                },
              ]}
            >
              <View style={styles.themePreviewHeader}>
                {data.logoUrl ? (
                  <Image source={{ uri: data.logoUrl }} style={styles.themePreviewLogo} />
                ) : (
                  <View style={[styles.themePreviewLogoPlaceholder, { backgroundColor: safeColor(data.accentColor) }]} />
                )}
                <Text
                  style={[
                    styles.themePreviewName,
                    { color: data.themeMode === 'DARK' ? '#FFFFFF' : '#1C1C1E' },
                  ]}
                >
                  {data.name || 'Community Name'}
                </Text>
              </View>
              <View style={[styles.themePreviewBar, { backgroundColor: safeColor(data.accentColor) }]} />
              <Text
                style={[
                  styles.themePreviewDesc,
                  { color: data.themeMode === 'DARK' ? '#8E8E93' : '#6B6B73' },
                ]}
              >
                {data.description || 'Your community description will appear here'}
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Choose Your Layout</Text>
            <Text style={styles.stepDesc}>
              How members will browse and interact with profiles in your
              community.
            </Text>
            {LAYOUT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.layoutCard,
                  data.layoutType === opt.key && {
                    borderColor: safeColor(data.accentColor),
                    backgroundColor: safeColor(data.accentColor) + '10',
                  },
                ]}
                onPress={() => updateField('layoutType', opt.key)}
              >
                <Text
                  style={[
                    styles.layoutTitle,
                    data.layoutType === opt.key && { color: safeColor(data.accentColor) },
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.layoutDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
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
              <Text style={[styles.addBtnText, { color: safeColor(data.accentColor) }]}>
                + Add Question
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.stepTitle}>Community Rules</Text>
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
              <Text style={[styles.addBtnText, { color: safeColor(data.accentColor) }]}>
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
                style={[
                  styles.layoutCard,
                  data.pricingType === opt.key && {
                    borderColor: safeColor(data.accentColor),
                    backgroundColor: safeColor(data.accentColor) + '10',
                  },
                ]}
                onPress={() => updateField('pricingType', opt.key)}
              >
                <Text
                  style={[
                    styles.layoutTitle,
                    data.pricingType === opt.key && { color: safeColor(data.accentColor) },
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.layoutDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
            {data.pricingType === 'SUBSCRIPTION' && (
              <InputField
                label="Monthly Price ($)"
                placeholder="9.99"
                value={data.subscriptionPrice}
                onChangeText={(text) => updateField('subscriptionPrice', text)}
                keyboardType="decimal-pad"
              />
            )}
            {data.pricingType === 'TOKEN' && (
              <InputField
                label="Token Cost (per action)"
                placeholder="5"
                value={data.tokenCost}
                onChangeText={(text) => updateField('tokenCost', text)}
                keyboardType="number-pad"
              />
            )}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Accept All-Access Passport?</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  data.acceptsPassport && {
                    backgroundColor: safeColor(data.accentColor),
                  },
                ]}
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
              Set a welcome message and optional features for your community.
            </Text>
            <InputField
              label="Welcome Message"
              hint="Shown to new members after they're approved"
              placeholder="Welcome to our community! Here are some tips..."
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
              <Text style={[styles.addBtnText, { color: safeColor(data.accentColor) }]}>
                + Add Tag
              </Text>
            </TouchableOpacity>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Matchmaker Mode?</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  data.matchmakerEnabled && {
                    backgroundColor: safeColor(data.accentColor),
                  },
                ]}
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
              Everything looks good? Let's launch your community!
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
        {renderStep()}
      </ScrollView>
      <View style={styles.footer}>
        {step > 1 && (
          <WizardButton
            title="Back"
            variant="ghost"
            onPress={prevStep}
          />
        )}
        <View style={styles.spacer} />
        {step < TOTAL_STEPS ? (
          <WizardButton
            title="Next"
            accentColor={safeColor(data.accentColor)}
            onPress={nextStep}
          />
        ) : (
          <WizardButton
            title="Launch Community"
            accentColor={safeColor(data.accentColor)}
            onPress={handleFinalize}
            loading={loading}
          />
        )}
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
  hint: { color: '#6B6B73', fontSize: 13, marginBottom: 8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  spacer: { flex: 1 },
  optionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionChipText: { color: '#6B6B73', fontSize: 14, fontWeight: '500' },
  layoutCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  layoutTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '600' },
  layoutDesc: { color: '#6B6B73', fontSize: 13, marginTop: 4 },
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
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 8,
  },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  logoPlaceholderIcon: { fontSize: 28 },
  logoPlaceholderText: { fontSize: 12, color: '#6B6B73', marginTop: 4 },
  logoRemoveText: { color: '#E63946', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#1C1C1E',
    transform: [{ scale: 1.15 }],
  },
  colorCheck: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  themePreview: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  themePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themePreviewLogo: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  themePreviewLogoPlaceholder: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  themePreviewName: { fontSize: 16, fontWeight: '700' },
  themePreviewBar: { height: 4, borderRadius: 2, marginBottom: 10 },
  themePreviewDesc: { fontSize: 13, lineHeight: 18 },
});
