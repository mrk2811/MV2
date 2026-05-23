import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export function InputField({
  label,
  hint,
  error,
  multiline,
  numberOfLines,
  style,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: 80, textAlignVertical: 'top' as const },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#555"
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  hint: { color: '#888892', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: '#1A1A1D',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  inputError: { borderColor: '#E63946' },
  error: { color: '#E63946', fontSize: 12, marginTop: 4 },
});
