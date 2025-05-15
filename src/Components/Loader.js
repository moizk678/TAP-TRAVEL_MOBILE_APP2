import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
  Text,
} from "react-native";

const Loader = ({
  size = "large",
  color = "#292966",
  label = "Loading...",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
});

export default Loader;
