import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface WizardButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  accentColor?: string;
}

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
        isPrimary && { backgroundColor: accentColor },
        !isPrimary && !isGhost && styles.secondary,
        isGhost && styles.ghost,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : accentColor} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            !isPrimary && !isGhost && { color: accentColor },
            isGhost && styles.ghostText,
          ]}
        >
          {title}
        </Text>
      )}
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
    borderColor: '#2A2A2E',
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#FFFFFF' },
  ghostText: { color: '#888892' },
});
