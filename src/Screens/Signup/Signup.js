import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import { useTheme } from "../../theme/theme";

const Signup = ({ navigation }) => {
  const { theme } = useTheme();
  const [state, setState] = useState({
    isLoading: false,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    isSecure: true,
    isSecureConfirm: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const updateState = (data) => setState((prev) => ({ ...prev, ...data }));

  const togglePasswordVisibility = () => {
    updateState({ isSecure: !state.isSecure });
  };

  const toggleConfirmPasswordVisibility = () => {
    updateState({ isSecureConfirm: !state.isSecureConfirm });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhoneNumber = (phone) => {
    // Validates phone number starting with 03 and exactly 11 digits
    const phoneRegex = /^03\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (field, value) => {
    let errorMessage = "";

    switch (field) {
      case "name":
        if (!value.trim()) {
          errorMessage = "Name is required";
        } else if (value.trim().length < 3) {
          errorMessage = "Name must be at least 3 characters";
        }
        break;

      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!validateEmail(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          errorMessage = "Password is required";
        } else if (!validatePassword(value)) {
          errorMessage = "Password must be at least 8 characters with uppercase, lowercase, and number";
        }
        break;

      case "confirmPassword":
        if (!value) {
          errorMessage = "Please confirm your password";
        } else if (value !== state.password) {
          errorMessage = "Passwords don't match";
        }
        break;

      case "phoneNumber":
        if (!value.trim()) {
          errorMessage = "Phone number is required";
        } else if (!validatePhoneNumber(value)) {
          errorMessage = "Please enter a valid phone number starting with 03 (11 digits total)";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const handleInputChange = (field, value) => {
    // For phone number, only allow digits and enforce 03 prefix
    if (field === "phoneNumber") {
      // Remove non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      
      // Ensure it starts with "03" if user is typing
      let formattedValue = digitsOnly;
      if (digitsOnly.length > 0 && !digitsOnly.startsWith("03")) {
        formattedValue = "03" + digitsOnly.substring(Math.min(2, digitsOnly.length));
      }
      
      // Limit to 11 digits
      formattedValue = formattedValue.substring(0, 11);
      
      updateState({ [field]: formattedValue });
    } else {
      updateState({ [field]: value });
    }
    
    // Clear the specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateAllFields = () => {
    const nameError = validateField("name", state.name);
    const emailError = validateField("email", state.email);
    const passwordError = validateField("password", state.password);
    const confirmPasswordError = validateField("confirmPassword", state.confirmPassword);
    const phoneNumberError = validateField("phoneNumber", state.phoneNumber);

    return nameError && emailError && passwordError && confirmPasswordError && phoneNumberError;
  };

  const onSignUp = async () => {
    if (!validateAllFields()) {
      Toast.show({ 
        type: "error", 
        text1: "Validation Error", 
        text2: "Please fix the errors in the form"
      });
      return;
    }

    updateState({ isLoading: true });

    try {
      const response = await apiClient.post("/user/register", {
        name: state.name,
        email: state.email,
        password: state.password,
        phoneNumber: state.phoneNumber,
      });

      if (response.data) {
        Toast.show({ 
          type: "success", 
          text1: "Registration Successful!", 
          text2: "OTP sent to your email" 
        });
        navigation.navigate("OtpVerification", { email: state.email });
      }
    } catch (error) {
      let errorMessage = "Sign up failed. Please try again.";
      
      // Handle specific error responses from the API
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = "This email is already registered";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Toast.show({ 
        type: "error", 
        text1: "Registration Failed", 
        text2: errorMessage 
      });
    } finally {
      updateState({ isLoading: false });
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
              <Text style={styles.subtitle}>Start your journey with us</Text>
            </View>
          </Animatable.View>

          {/* Signup Form Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.formCard}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.formSubtitle}>Join us and start your travel experience</Text>
            </View>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginNow, { color: theme.colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name Input */}
            <AppInput
              placeholder="Enter your full name"
              value={state.name}
              onChangeText={(value) => handleInputChange("name", value)}
              onBlur={() => validateField("name", state.name)}
              error={errors.name}
              autoCapitalize="words"
            />

            {/* Email Input */}
            <AppInput
              placeholder="Enter your email"
              value={state.email}
              keyboardType="email-address"
              onChangeText={(value) => handleInputChange("email", value)}
              onBlur={() => validateField("email", state.email)}
              error={errors.email}
              autoCapitalize="none"
            />

            {/* Phone Number Input */}
            <AppInput
              placeholder="Enter phone number (03-)"
              value={state.phoneNumber}
              keyboardType="phone-pad"
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              onBlur={() => validateField("phoneNumber", state.phoneNumber)}
              error={errors.phoneNumber}
            />

            {/* Password Input */}
            <AppInput
              placeholder="Create a password"
              secureTextEntry={state.isSecure}
              value={state.password}
              onChangeText={(value) => handleInputChange("password", value)}
              onBlur={() => validateField("password", state.password)}
              rightIcon={state.isSecure ? "eye-off" : "eye"}
              onRightIconPress={togglePasswordVisibility}
              error={errors.password}
            />

            {/* Confirm Password Input */}
            <AppInput
              placeholder="Confirm your password"
              secureTextEntry={state.isSecureConfirm}
              value={state.confirmPassword}
              onChangeText={(value) => handleInputChange("confirmPassword", value)}
              onBlur={() => validateField("confirmPassword", state.confirmPassword)}
              rightIcon={state.isSecureConfirm ? "eye-off" : "eye"}
              onRightIconPress={toggleConfirmPasswordVisibility}
              error={errors.confirmPassword}
            />

            {/* Sign Up Button */}
            <AppButton
              text="Create Account"
              onPress={onSignUp}
              variant="primary"
              isLoading={state.isLoading}
              style={styles.signupButton}
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
  signupButton: {
    marginBottom: 32,
    marginTop: 8,
    height: 56,
  },
});

export default Signup;