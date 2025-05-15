import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Routes from "./src/Navigations/Route";
import FlashMessage from "react-native-flash-message";
import { Provider } from "react-redux";
import store from "./src/store/store";
import { AuthProvider } from "./src/context/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./src/theme/theme";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 👈 Show the popup/banner
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔹 Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    setTimeout(() => {
      onFinish();
    }, 2000); // Show splash for 2 seconds
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />
      <Text style={styles.splashText}>Tap&Travel</Text>
    </View>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo Push Token:", token);
        // 🔸 You can send this token to your backend here if needed
      } else {
        alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };

    registerForPushNotifications();

    // 🔸 Foreground notification handler
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📲 Notification Received:", notification);
      }
    );

    // 🔸 Background/tapped notification handler
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔁 User interacted with notification:", response);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return isLoading ? (
    <SplashScreen onFinish={() => setIsLoading(false)} />
  ) : (
    <StripeProvider publishableKey="pk_test_51QMkUFKzfMgYIpCx3iDEwl4GbcNYQyEwhJKqGsc8BAuQ8h7pHFJqjhGR6LfImDlOojLfiV0DngTdZv1OBiv3w8c500a980IyyP">
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <View style={{ flex: 1 }}>
              <Routes />
              <Toast />
              <FlashMessage position="top" />
            </View>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </StripeProvider>
  );
}

// 🔹 Styles for Splash Screen
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  splashText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
