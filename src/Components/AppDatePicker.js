import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/theme";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0]; // You can customize this
};

const AppDatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  format = "YYYY-MM-DD", // reserved for future formatting
  variant = "primary",
  borderRadius = 12,
  error = "",
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const borderColor = theme.colors[variant] || theme.colors.primary;

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    onChange(date);
    hideDatePicker();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        onPress={showDatePicker}
        style={[
          styles.container,
          {
            borderColor,
            borderRadius,
            backgroundColor: "#f5f6fa",
          },
        ]}
        activeOpacity={0.9}
      >
        <TextInput
          style={styles.input}
          value={value ? formatDate(value) : ""}
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={false}
          {...props}
        />
        <Ionicons name="calendar" size={22} color="#7f8c8d" style={styles.icon} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderWidth: 1.2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  icon: {
    marginLeft: 8,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AppDatePicker;
