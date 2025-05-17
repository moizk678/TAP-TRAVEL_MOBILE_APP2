import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";
import AppButton from "../../Components/Button";
import AppInput from "../../Components/AppInput";
import { isValidEmail } from "../../utils/isValidEmail";
import { useTheme } from "../../theme/theme";

const ForgotEmail = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (value) => {
    setEmail(value);
    if (error) setError("");
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      Toast.show({ 
        type: "error", 
        text1: "Validation Error",
        text2: "Please enter a valid email"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("user/forgot-password/send-otp", {
        email,
      });

      if (response?.status === 200) {
        Toast.show({ 
          type: "success", 
          text1: "OTP Sent Successfully",
          text2: response?.data?.message 
        });
        navigation.navigate("ForgotOtp", { email });
      } else {
        Toast.show({
          type: "error",
          text1: "Request Failed",
          text2: response?.data?.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Server Error",
        text2: error?.message || "Something went wrong" 
      });
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animatable.View animation="fadeInDown" duration={800} delay={200}>
            <View style={styles.headerSection}>
                <MaterialIcons
                  name="directions-bus"
                  size={60}
                  color={theme.colors.primary}
                />
              <Text style={[styles.appName, { color: theme.colors.primary }]}>Tap & Travel</Text>
              <Text style={styles.subtitle}>Your journey starts here</Text>
            </View>
          </Animatable.View>

          {/* Forgot Password Form Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.formCard}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>Forgot Password</Text>
              <Text style={styles.formSubtitle}>Enter your registered email to receive an OTP</Text>
            </View>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginNow, { color: theme.colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <AppInput
              placeholder="Enter your email"
              value={email}
              onChangeText={handleInputChange}
              onBlur={validateEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Send OTP Button */}
            <AppButton
              text="Send OTP"
              onPress={handleSendOtp}
              variant="primary"
              isLoading={isLoading}
              style={styles.sendOtpButton}
            />
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 1,
    paddingBottom: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "400",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginNow: {
    fontSize: 14,
    fontWeight: "600",
  },
  sendOtpButton: {
    marginTop: 16,
    height: 56,
  }
});

export default ForgotEmail;