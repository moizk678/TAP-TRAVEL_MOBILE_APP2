import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { useTheme } from "../theme/theme";

const AppButton = ({
  text,
  onPress,
  isLoading = false,
  variant = "primary",
  style,
}) => {
  const { theme } = useTheme();
  const [scale] = useState(new Animated.Value(1));

  const colorMap = {
    primary: theme.colors.primary || "#6c5ce7",
    secondary: theme.colors.secondary || "#00cec9",
    green: theme.colors.green || "#00b894",
    danger: "#d63031",
  };

  const backgroundColor = colorMap[variant] || colorMap.primary;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={isLoading}
        style={[styles.button, { backgroundColor }]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 30,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    }),
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.6,
  },
});

export default AppButton;
