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
        placeholderTextColor="#8E8E93"
        multiline={multiline}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: '#1C1C1E', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  hint: { color: '#6B6B73', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    padding: 14,
    color: '#1C1C1E',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputError: { borderColor: '#E63946' },
  error: { color: '#E63946', fontSize: 12, marginTop: 4 },
});
