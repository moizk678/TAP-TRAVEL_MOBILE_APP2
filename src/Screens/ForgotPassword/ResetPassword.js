import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import AppButton from "../../Components/Button";
import AppInput from "../../Components/AppInput";
import Toast from "react-native-toast-message";
import apiClient from "../../api/apiClient";
import { useTheme } from "../../theme/theme";

const passwordRules = [
  { label: "Minimum 8 characters", test: (val) => val.length >= 8 },
  { label: "At least one capital letter", test: (val) => /[A-Z]/.test(val) },
  { label: "At least one number", test: (val) => /\d/.test(val) },
  {
    label: "At least one special character",
    test: (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
  },
];

const ResetPassword = ({ navigation, route }) => {
  const { email, secret_key } = route?.params || {};
  const { theme } = useTheme();
  
  const [state, setState] = useState({
    password: "",
    confirmPassword: "",
    isLoading: false,
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [validationResults, setValidationResults] = useState({
    rulesStatus: passwordRules.map(rule => ({ ...rule, valid: false })),
    passwordsMatch: false,
  });

  useEffect(() => {
    if (!email || !secret_key) {
      Toast.show({
        type: "error",
        text1: "Invalid Request",
        text2: "Missing required information to reset password"
      });
      navigation.replace("ForgotEmail");
    }
  }, [email, secret_key]);

  const updateState = (data) => setState(prev => ({ ...prev, ...data }));

  // Validate password against rules and update validation state
  useEffect(() => {
    const rulesStatus = passwordRules.map(rule => ({
      ...rule,
      valid: rule.test(state.password),
    }));

    const passwordsMatch = state.confirmPassword.length > 0 && 
      state.password === state.confirmPassword;

    setValidationResults({
      rulesStatus,
      passwordsMatch,
    });

    // Update error messages
    let passwordError = "";
    if (state.password && !rulesStatus.every(rule => rule.valid)) {
      passwordError = "Password does not meet all requirements";
    }

    let confirmError = "";
    if (state.confirmPassword && !passwordsMatch) {
      confirmError = "Passwords do not match";
    }

    setErrors(prev => ({ 
      ...prev, 
      password: passwordError,
      confirmPassword: confirmError 
    }));
  }, [state.password, state.confirmPassword]);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      updateState({ isPasswordVisible: !state.isPasswordVisible });
    } else {
      updateState({ isConfirmPasswordVisible: !state.isConfirmPasswordVisible });
    }
  };

  const validateForm = () => {
    // Check if all rules are valid
    const isPasswordValid = validationResults.rulesStatus.every(rule => rule.valid);
    const passwordsMatch = state.password === state.confirmPassword;

    let formErrors = {
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!state.password) {
      formErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      formErrors.password = "Password does not meet all requirements";
    }

    if (!state.confirmPassword) {
      formErrors.confirmPassword = "Please confirm your password";
    } else if (!passwordsMatch) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(formErrors);

    return isPasswordValid && passwordsMatch && state.password.length > 0 && 
      state.confirmPassword.length > 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors before submitting"
      });
      return;
    }

    updateState({ isLoading: true });
    
    try {
      const response = await apiClient.post("/user/forgot-password/reset", {
        email,
        secret_key,
        newPassword: state.password,
      });

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: response?.data?.message || "Password reset successfully!"
      });
      navigation.replace("Login");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
        "Failed to reset password. Please try again.";
      
      // Check for specific error types
      if (error?.response?.status === 400) {
        setErrors(prev => ({ ...prev, general: "Invalid request parameters" }));
      } else if (error?.response?.status === 401) {
        setErrors(prev => ({ ...prev, general: "Reset link has expired" }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
      
      Toast.show({
        type: "error",
        text1: "Password Reset Failed",
        text2: errorMessage
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const isFormValid = validationResults.rulesStatus.every(rule => rule.valid) && 
    validationResults.passwordsMatch && 
    state.password.length > 0 && 
    state.confirmPassword.length > 0;

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
              <Text style={styles.subtitle}>Reset your password</Text>
            </View>
          </Animatable.View>

          {/* Form Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.formCard}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>Create New Password</Text>
              <Text style={styles.formSubtitle}>Please set a secure password for your account</Text>
            </View>

            {/* General Error Message */}
            {errors.general ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Password Input */}
            <AppInput
              placeholder="New Password"
              secureTextEntry={!state.isPasswordVisible}
              value={state.password}
              onChangeText={(password) => updateState({ password })}
              rightIcon={state.isPasswordVisible ? "eye" : "eye-off"}
              onRightIconPress={() => togglePasswordVisibility('password')}
              error={errors.password}
            />

            {/* Confirm Password Input */}
            <AppInput
              placeholder="Confirm Password"
              secureTextEntry={!state.isConfirmPasswordVisible}
              value={state.confirmPassword}
              onChangeText={(confirmPassword) => updateState({ confirmPassword })}
              rightIcon={state.isConfirmPasswordVisible ? "eye" : "eye-off"}
              onRightIconPress={() => togglePasswordVisibility('confirmPassword')}
              error={errors.confirmPassword}
            />

            {/* Password Requirements */}
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>Password must have:</Text>
              {validationResults.rulesStatus.map((rule, index) => (
                <View key={index} style={styles.ruleRow}>
                  <Feather 
                    name={rule.valid ? "check-circle" : "circle"} 
                    size={16} 
                    color={rule.valid ? "green" : "#888"} 
                    style={styles.ruleIcon}
                  />
                  <Text
                    style={[
                      styles.ruleText, 
                      { color: rule.valid ? "green" : "#888" }
                    ]}
                  >
                    {rule.label}
                  </Text>
                </View>
              ))}
              {state.confirmPassword.length > 0 && (
                <View style={styles.ruleRow}>
                  <Feather 
                    name={validationResults.passwordsMatch ? "check-circle" : "circle"} 
                    size={16} 
                    color={validationResults.passwordsMatch ? "green" : "#888"} 
                    style={styles.ruleIcon}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      { color: validationResults.passwordsMatch ? "green" : "#888" }
                    ]}
                  >
                    Passwords match
                  </Text>
                </View>
              )}
            </View>

            {/* Reset Button */}
            <AppButton
              text="Reset Password"
              onPress={handleResetPassword}
              variant="primary"
              isLoading={state.isLoading}
              disabled={!isFormValid}
              style={styles.resetButton}
            />

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPassword;


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
  generalErrorContainer: {
    backgroundColor: "#ffeeee",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  generalErrorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  rulesContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleIcon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
  },
  resetButton: {
    marginBottom: 24,
    height: 56,
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