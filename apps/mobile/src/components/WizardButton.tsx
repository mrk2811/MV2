import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';

interface WizardButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  accentColor?: string;
}

// Pre-built accent background styles (avoids inline style objects — iOS Fabric safe)
const ACCENT_BG: Record<string, ReturnType<typeof StyleSheet.flatten>> = {};
const ACCENT_TEXT: Record<string, ReturnType<typeof StyleSheet.flatten>> = {};
const COMMON_ACCENTS = [
  '#E63946', '#FF6B6B', '#FF8C42', '#F4A261',
  '#E9C46A', '#2A9D8F', '#06D6A0', '#4ECDC4',
  '#3A86FF', '#6C63FF', '#8338EC', '#FF006E',
  '#1D3557', '#457B9D', '#A8DADC', '#264653',
];
COMMON_ACCENTS.forEach((c) => {
  ACCENT_BG[c] = StyleSheet.create({ s: { backgroundColor: c } }).s;
  ACCENT_TEXT[c] = StyleSheet.create({ s: { color: c } }).s;
});

export function WizardButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accentColor = '#E63946',
}: WizardButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? (ACCENT_BG[accentColor] ?? styles.fallbackBg) : undefined,
        !isPrimary && !isGhost ? styles.secondary : undefined,
        isGhost ? styles.ghost : undefined,
        disabled ? styles.disabled : undefined,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {/* Both always in tree — only display toggles. Prevents iOS Fabric tree mutation crash. */}
      <View style={loading ? styles.visible : styles.hidden}>
        <ActivityIndicator color={isPrimary ? '#FFF' : accentColor} />
      </View>
      <View style={loading ? styles.hidden : styles.visible}>
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : undefined,
            !isPrimary && !isGhost ? (ACCENT_TEXT[accentColor] ?? styles.fallbackText) : undefined,
            isGhost ? styles.ghostText : undefined,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#FFFFFF' },
  ghostText: { color: '#6B6B73' },
  fallbackBg: { backgroundColor: '#E63946' },
  fallbackText: { color: '#E63946' },
  visible: {},
  hidden: { display: 'none' },
});
