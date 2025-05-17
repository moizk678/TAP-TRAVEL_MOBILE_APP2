import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import AppButton from "../../Components/Button";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";
import { isValidEmail } from "../../utils/isValidEmail";
import { useTheme } from "../../theme/theme";

const ForgotOtp = ({ navigation, route }) => {
  const { theme } = useTheme();
  const email = route?.params?.email;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      navigation.replace("ForgotEmail");
    }
  }, [email]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (nativeEvent, index) => {
    if (nativeEvent.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await apiClient.post("user/forgot-password/send-otp", {
        email,
      });

      if (response?.status === 200) {
        Toast.show({ 
          type: "success", 
          text1: "OTP Sent Successfully",
          text2: "A new OTP has been sent to your email" 
        });
      }
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Failed to Resend OTP",
        text2: error?.message || "Please try again"
      });
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Toast.show({ 
        type: "error", 
        text1: "Invalid OTP",
        text2: "Please enter a 6-digit OTP" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post(
        "/user/forgot-password/verify-otp",
        {
          email,
          otp: code,
        }
      );

      Toast.show({ 
        type: "success", 
        text1: "OTP Verified",
        text2: response?.data?.message 
      });
      navigation.navigate("ResetPassword", {
        email,
        secret_key: response?.data?.secret_key,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error?.response?.data?.message || "OTP verification failed",
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

          {/* OTP Verification Form Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.formCard}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>OTP Verification</Text>
              <Text style={styles.formSubtitle}>
                Enter the 6-digit code sent to{" "}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            {/* OTP Input Container */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    { borderColor: digit ? theme.colors.primary : "#E2E8F0" }
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent, index)
                  }
                />
              ))}
            </View>

            {/* Resend OTP option */}
            <TouchableOpacity 
              onPress={handleResendOtp}
              style={styles.resendContainer}
            >
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <Text style={[styles.resendLink, { color: theme.colors.primary }]}>
                Resend OTP
              </Text>
            </TouchableOpacity>

            {/* Verify OTP Button */}
            <AppButton
              text="Verify OTP"
              onPress={handleVerifyOtp}
              variant="primary"
              isLoading={isLoading}
              style={styles.verifyButton}
            />

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginNow, { color: theme.colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
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
  emailText: {
    fontWeight: "600",
    color: "#1E293B",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#64748B",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  verifyButton: {
    height: 56,
    marginBottom: 20,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
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
  }
});

export default ForgotOtp;