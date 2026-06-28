import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  accentColor?: string;
}

// Pre-built width styles for 10 steps (avoids inline style objects — iOS Fabric safe)
const TOTAL = 10;
const WIDTH_STYLES: Record<number, ViewStyle> = {};
for (let i = 1; i <= TOTAL; i++) {
  const pct = `${Math.round((i / TOTAL) * 100)}%`;
  WIDTH_STYLES[i] = StyleSheet.create({ s: { width: pct as never } }).s;
}

// Pre-built background-color styles for the accent palette
const ACCENT_COLORS = [
  '#E63946', '#FF6B6B', '#FF8C42', '#F4A261',
  '#E9C46A', '#2A9D8F', '#06D6A0', '#4ECDC4',
  '#3A86FF', '#6C63FF', '#8338EC', '#FF006E',
  '#1D3557', '#457B9D', '#A8DADC', '#264653',
];
const BG_STYLES: Record<string, ViewStyle> = {};
ACCENT_COLORS.forEach((c) => {
  BG_STYLES[c] = StyleSheet.create({ s: { backgroundColor: c } }).s;
});
const FALLBACK_BG: ViewStyle = StyleSheet.create({ s: { backgroundColor: '#E63946' } }).s;

export function StepIndicator({
  currentStep,
  totalSteps,
  accentColor = '#E63946',
}: StepIndicatorProps) {
  const widthStyle = WIDTH_STYLES[currentStep] ?? WIDTH_STYLES[1];
  const bgStyle = BG_STYLES[accentColor] ?? FALLBACK_BG;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, widthStyle, bgStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 16 },
  label: { color: '#6B6B73', fontSize: 13, marginBottom: 8 },
  track: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
});
