import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import AppButton from "../../Components/Button";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../theme/theme";

const OtpVerification = ({ route }) => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const { email } = route.params;
  const { theme } = useTheme();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const updatedOtp = [...otp];
      updatedOtp[index - 1] = "";
      setOtp(updatedOtp);
    }
  };

  const onVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Toast.show({ 
        type: "error", 
        text1: "Incomplete OTP",
        text2: "Please enter the complete 6-digit OTP"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/user/verify-otp", {
        email,
        otp: code,
      });

      if (response.data) {
        Toast.show({ 
          type: "success", 
          text1: "Verification Successful",
          text2: response?.data?.message || "Your account has been verified successfully"
        });
        await login(response?.data?.token);
      }
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Verification Failed",
        text2: error?.response?.data?.message || "Invalid or expired OTP" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      await apiClient.post("/user/resend-otp", { email });
      Toast.show({ 
        type: "success", 
        text1: "OTP Resent",
        text2: "A new OTP has been sent to your email"
      });
      setResendTimer(30);
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Failed to Resend OTP",
        text2: error?.response?.data?.message || "Please try again later"
      });
    }
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
              <Text style={styles.subtitle}>Verify your account</Text>
            </View>
          </Animatable.View>

          {/* OTP Form Card */}
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
                Enter the 6-digit code sent to:
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    { 
                      borderColor: digit ? theme.colors.primary : "#E2E8F0",
                      backgroundColor: digit ? "#F0F9FF" : "#F8FAFC" 
                    }
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            {/* Verify Button */}
            <AppButton
              text="Verify OTP"
              onPress={onVerifyOtp}
              isLoading={isLoading}
              variant="primary"
              style={styles.verifyButton}
            />

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={onResendOtp} disabled={resendTimer > 0}>
                <Text
                  style={[
                    styles.resendAction,
                    { color: resendTimer > 0 ? "#94A3B8" : theme.colors.primary }
                  ]}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP"}
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
    paddingVertical: 10,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  otpBox: {
    borderWidth: 1.5,
    borderRadius: 16,
    width: 50,
    height: 56,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
  },
  verifyButton: {
    marginBottom: 20,
    height: 56,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  resendText: {
    fontSize: 14,
    color: "#64748B",
  },
  resendAction: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 8,
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OtpVerification;