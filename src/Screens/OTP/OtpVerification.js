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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import AppButton from "../../Components/Button";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const OtpVerification = ({ route }) => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const { email } = route.params;

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
      Toast.show({ type: "error", text1: "Enter 6-digit OTP!" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/user/verify-otp", {
        email,
        otp: code,
      });

      if (response.data) {
        Toast.show({ type: "success", text1: response?.data?.message });
        await login(response?.data?.token);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "OTP Verification Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      await apiClient.post("/user/resend-otp", { email });
      Toast.show({ type: "success", text1: "OTP Resent!" });
      setResendTimer(30);
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to resend OTP!" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.logoContainer}
        >
          <Animatable.View animation="fadeInDown" duration={800}>
            <MaterialIcons name="location-on" size={64} color="white" />
            <Text style={styles.appName}>Tap & Travel</Text>
          </Animatable.View>
        </LinearGradient>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.bottomSection}
        >
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpBox}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <AppButton
            text="Verify OTP"
            onPress={onVerifyOtp}
            isLoading={isLoading}
            variant="primary"
          />

          <TouchableOpacity onPress={onResendOtp} disabled={resendTimer > 0}>
            <Text
              style={[
                styles.resendText,
                resendTimer > 0 && styles.disabledText,
              ]}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.registerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.registerNow}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292966",
  },
  logoContainer: {
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
    marginTop: 10,
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#292966",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: 50,
    height: 55,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#f7f7f7",
    color: "#292966",
    fontWeight: "bold",
  },
  resendText: {
    textAlign: "center",
    fontSize: 16,
    color: "#007aff",
    marginTop: 16,
  },
  disabledText: {
    color: "gray",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#999",
    fontSize: 14,
  },
  registerNow: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
});
