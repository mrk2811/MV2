import { Stack } from 'expo-router';

export default function WizardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F10' },
        animation: 'slide_from_right',
      }}
    />
  );
}
