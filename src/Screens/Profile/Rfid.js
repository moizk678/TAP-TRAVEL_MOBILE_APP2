import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, BackHandler, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import RFIDOrderModal from "./RFIDOrderModal";
import { RFIDNavigationContext } from "../../Navigations/Route"; // Import the special context

const Rfid = (props) => {
  const [user, setUser] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the setRFIDComplete function from context
  const { setRFIDComplete } = useContext(RFIDNavigationContext);

  // Prevent back button presses
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          'Required Step',
          'You need to complete RFID booking to continue.',
          [{ text: 'OK' }]
        );
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found in Rfid component");
        return;
      }
      
      const decoded = jwtDecode(token);
      const { data } = await apiClient.get(`/user/${decoded.sub}`);
      const u = data.user;
      
      console.log("User data in Rfid component:", u?.RFIDCardStatus);

      setUser(u);
      setShowOrderForm(true); // Always show the form in this component
    } catch (error) {
      console.error("Error fetching user info:", error);
      Toast.show({ type: "error", text1: "Error fetching user info" });
    }
  };

  const handleRFIDSubmit = async (addressData) => {
    if (
      !addressData?.province ||
      !addressData?.city ||
      !addressData?.postalCode ||
      !addressData?.address
    ) {
      Toast.show({ type: "info", text1: "Please fill all fields" });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);

      // Save RFID status to server
      await apiClient.patch("/user/update-profile", {
        userId,
        address: addressData,
        RFIDCardStatus: "booked",
      });

      Toast.show({ type: "success", text1: "RFID card booked!" });
      
      console.log("RFID successfully booked, using context to navigate");
      
      // Clear any stale RFID status before setting the new one
      await AsyncStorage.removeItem("RFIDCardStatus");
      
      // Use the context function to handle navigation or directly set storage as backup
      if (setRFIDComplete) {
        setRFIDComplete();
      } else {
        console.error("setRFIDComplete function not available in context");
        // Direct fallback - just set the AsyncStorage value
        await AsyncStorage.setItem("RFIDCardStatus", "booked");
        // Try to force a page refresh
        Alert.alert(
          "RFID Booked",
          "Your RFID card has been booked successfully. The app will now continue.",
          [
            { 
              text: "Continue", 
              onPress: () => {
                // This fallback only applies if the context method fails
                const { navigate } = props.navigation;
                if (navigate) {
                  navigate('MainTabs');
                }
              } 
            }
          ]
        );
      }
    } catch (error) {
      console.error("RFID booking failed:", error);
      Toast.show({ type: "error", text1: "RFID booking failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book your RFID Card</Text>
      <Text style={styles.text}>Please complete this step to continue.</Text>

      <RFIDOrderModal
        visible={showOrderForm}
        onClose={() => {}}
        onSubmit={handleRFIDSubmit}
        initialAddress={selectedAddress}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

export default Rfid;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});