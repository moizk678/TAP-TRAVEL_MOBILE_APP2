import React, { useContext, useState, useEffect } from "react";
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

import validator from "../../utils/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import AppButton from "../../Components/Button";
import AppInput from "../../Components/AppInput";
import { registerExpoPushToken } from "../../utils/notificationHelper";
import { useTheme } from "../../theme/theme";

export const loginUser = async (userData) => {
  try {
    const response = await fetch(LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      await AsyncStorage.setItem("token", data.token);
      await registerExpoPushToken(data?.userId);
      return { success: true, data };
    } else {
      return { 
        success: false, 
        message: data.message || "Login failed",
        status: response.status
      };
    }
  } catch (err) {
    return { success: false, message: err.message || "Unexpected error" };
  }
};

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const { theme } = useTheme();
  const [state, setState] = useState({
    isLoading: false,
    email: "",
    password: "",
    isSecure: true,
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { isLoading, email, password, isSecure } = state;

  const updateState = (data) => setState((prev) => ({ ...prev, ...data }));

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    } else if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleInputChange = (field, value) => {
    updateState({ [field]: value });
    
    // Clear the specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field, value) => {
    let errorMessage = "";
    
    switch (field) {
      case "email":
        errorMessage = validateEmail(value);
        break;
      case "password":
        errorMessage = validatePassword(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const validateAllFields = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });
    
    return !emailError && !passwordError;
  };

  const togglePasswordVisibility = () => {
    updateState({ isSecure: !isSecure });
  };

  const onLogin = async () => {
    if (!validateAllFields()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors in the form"
      });
      return;
    }

    updateState({ isLoading: true });

    const response = await loginUser({ email, password });

    if (response.success) {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!"
      });
      await login(response?.data?.token);
    } else {
      // Handle specific error cases
      if (response.status === 401) {
        Toast.show({
          type: "error",
          text1: "Authentication Failed",
          text2: "Invalid email or password"
        });
      } else if (response.status === 404) {
        Toast.show({
          type: "error",
          text1: "Account Not Found",
          text2: "No account exists with this email"
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response.message || "Please try again later"
        });
      }
    }

    updateState({ isLoading: false });
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

          {/* Login Form Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.formCard}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>
            </View>

            {/* Registration Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={[styles.registerNow, { color: theme.colors.primary }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <AppInput
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => handleInputChange("email", value)}
              onBlur={() => validateField("email", email)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password Input */}
            <AppInput
              placeholder="Enter your password"
              value={password}
              secureTextEntry={isSecure}
              onChangeText={(value) => handleInputChange("password", value)}
              onBlur={() => validateField("password", password)}
              error={errors.password}
              rightIcon={isSecure ? "eye-off" : "eye"}
              onRightIconPress={togglePasswordVisibility}
            />

            {/* Forgot Password */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("ForgotEmail")}
              style={styles.forgotPasswordContainer}
            >
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AppButton
              text="Sign In"
              onPress={onLogin}
              variant="primary"
              isLoading={isLoading}
              style={styles.loginButton}
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
logoContainer: {
  width: 70,
  height: 70,
  borderRadius: 35,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
  elevation: 2,
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
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  registerText: {
    fontSize: 14,
    color: "#64748B",
  },
  registerNow: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "transparent",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 32,
    height: 56,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#64748B",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  socialText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Login;