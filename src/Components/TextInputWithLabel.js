import React from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';

const TextInputWithLabel = ({
  label,
  value,
  placeholder,
  secureTextEntry = false,
  onChangeText,
  keyboardType = "default",
  style,
  ...props
}) => {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f4f6f8',
    color: '#2C3E50',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dcdde1',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

export default TextInputWithLabel;
