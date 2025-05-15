import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AppInput from "../../Components/AppInput";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";
import AppButton from "../../Components/Button";
import { isValidEmail } from "../../utils/isValidEmail";

const ForgotEmail = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      Toast.show({ type: "error", text1: "Please enter a valid email" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("user/forgot-password/send-otp", {
        email,
      });

      if (response?.status === 200) {
        Toast.show({ type: "success", text1: response?.data?.message });
        navigation.navigate("ForgotOtp", { email });
      } else {
        Toast.show({
          type: "error",
          text1: response?.data?.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: error?.message || "Server error" });
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.topSection}
        >
          <Animatable.View animation="fadeInDown" duration={800}>
            <MaterialIcons
              name="location-on"
              size={64}
              color="white"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.appName}>Tap & Travel</Text>
          </Animatable.View>
        </LinearGradient>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.bottomSection}
        >
          <Text style={styles.welcomeText}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email to receive an OTP.
          </Text>

          <AppInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.loginRedirectRow}>
            <Text style={styles.grayText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 16 }} />
          <AppButton
            text="Send OTP"
            onPress={handleSendOtp}
            disabled={!isValidEmail(email)}
            variant="primary"
            isLoading={isLoading}
          />
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292966",
  },
  topSection: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomSection: {
    flex: 2,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 8,
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 20,
  },
  loginRedirectRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  grayText: {
    color: "#999",
    fontSize: 14,
  },
  loginText: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ForgotEmail;
