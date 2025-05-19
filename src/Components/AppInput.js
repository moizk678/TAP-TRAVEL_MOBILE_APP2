import React from "react";
import { useTheme } from "../theme/theme";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Feather"; // Make sure Feather is installed

const AppInput = ({
  label,
  placeholder = "Enter text",
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  variant = "primary",
  borderRadius = 12,
  error = "",
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const borderColor = theme.colors[variant] || theme.colors.primary;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderRadius,
            backgroundColor: "#f7f9fc",
          },
        ]}
      >
        <TextInput
          style={[styles.input, rightIcon ? { flex: 1 } : null]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconWrapper}>
            <Icon name={rightIcon} size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    marginBottom: 6,
    color: "#2c3e50",
  },
  inputContainer: {
    borderWidth: 1.2,
    flexDirection: "row", // ✅ needed for icon alignment
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: "#2c3e50",
  },
  iconWrapper: {
    marginLeft: 10,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#e74c3c",
  },
});

export default AppInput;
