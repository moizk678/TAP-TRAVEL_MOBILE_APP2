// utils/notificationHelper.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import apiClient from "../api/apiClient";

export const registerExpoPushToken = async (userId) => {
  try {
    if (!Device.isDevice) {
      alert("Push notifications only work on physical devices");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("🚫 Notification permission not granted");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    await apiClient.post("/user/save-token", {
      userId,
      fcmToken: token, // you can still call it this for consistency
    });

    console.log("✅ Token saved to backend");
  } catch (err) {
    console.error("❌ Error registering push token:", err.message);
  }
};
