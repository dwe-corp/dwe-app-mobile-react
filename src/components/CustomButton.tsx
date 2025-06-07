import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

export default function CustomButton({ title, onPress, color = '#1e90ff', disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: disabled ? '#aaa' : color }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
