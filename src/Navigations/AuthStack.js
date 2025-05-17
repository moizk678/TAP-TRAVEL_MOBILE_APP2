import React from "react";
import { Login, Signup } from "../";
import { createStackNavigator } from "@react-navigation/stack";
import OtpVerification from "../Screens/OTP/OtpVerification";
import ForgotEmail from "../Screens/ForgotPassword/ForgotEmail";
import ForgotOtp from "../Screens/ForgotPassword/ForgotOtp";
import ResetPassword from "../Screens/ForgotPassword/ResetPassword";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} />
      <Stack.Screen name="ForgotEmail" component={ForgotEmail} />
      <Stack.Screen name="ForgotOtp" component={ForgotOtp} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
}