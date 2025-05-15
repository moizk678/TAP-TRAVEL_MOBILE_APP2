import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useTheme } from "../theme/theme";
import Ionicons from "react-native-vector-icons/Ionicons";

const AppSelect = ({
  items = [],
  onValueChange,
  placeholder = "Select an option",
  value,
  variant = "primary",
  label,
  error,
  style,
}) => {
  const { theme } = useTheme();
  const borderColor = theme.colors[variant] || theme.colors.primary;

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.container, { borderColor }]}>
        <RNPickerSelect
          onValueChange={onValueChange}
          value={value}
          items={items}
          placeholder={{ label: placeholder, value: null }}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          Icon={() => <Ionicons name="chevron-down" size={20} color="gray" />}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2C3E50",
  },
  container: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 6,
    marginBottom: 8,
    backgroundColor: "#f7f9fc",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    color: "#2C3E50",
    paddingVertical: 6,
    paddingRight: 30, // for icon
  },
  inputAndroid: {
    fontSize: 16,
    color: "#2C3E50",
    paddingVertical: 6,
    paddingRight: 30,
  },
  iconContainer: {
    top: Platform.OS === "ios" ? 18 : 12,
    right: 10,
  },
});

export default AppSelect;
