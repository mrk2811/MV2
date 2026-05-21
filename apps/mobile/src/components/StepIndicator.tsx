import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  accentColor?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  accentColor = '#E63946',
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${(currentStep / totalSteps) * 100}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 16 },
  label: { color: '#888892', fontSize: 13, marginBottom: 8 },
  track: {
    height: 4,
    backgroundColor: '#1A1A1D',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
});
