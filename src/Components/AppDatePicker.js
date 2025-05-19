// Option 1: Using react-native-calendars for full customization
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { Calendar } from 'react-native-calendars';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/theme";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

const AppDatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  format = "YYYY-MM-DD",
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

  const handleDayPress = (day) => {
    onChange(day.dateString);
    hideDatePicker();
  };

  const calendarTheme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: theme.colors.primary,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: '#ffffff',
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.primary,
    textDisabledColor: theme.colors.tertiary,
    dotColor: theme.colors.secondary,
    selectedDotColor: '#ffffff',
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.primary,
    indicatorColor: theme.colors.primary,
    textDayFontWeight: '500',
    textMonthFontWeight: '600',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
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

      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDatePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContainer, { borderRadius: 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
                Select Date
              </Text>
              <TouchableOpacity onPress={hideDatePicker}>
                <Ionicons name="close" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [value]: {
                  selected: true,
                  selectedColor: theme.colors.primary,
                },
              }}
              theme={calendarTheme}
              minDate={new Date().toISOString().split('T')[0]}
              style={styles.calendar}
            />
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.tertiary }]}
                onPress={hideDatePicker}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
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
    paddingVertical: Platform.OS === "ios" ? 14 : 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendar: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AppDatePicker;