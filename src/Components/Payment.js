import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { apiBaseUrl } from "../config/urls";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../api/apiClient";
import AppButton from "./Button";

const Payment = ({ amount, adminId, userId, email, busId, selectedSeats, onSuccess }) => {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(`/payment/create-payment-intent`, {
        amount,
        busId,
        userId,
        adminId,
      });

      const { clientSecret, paymentId } = data;
      setPaymentId(paymentId);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Tap & Travel",
      });

      if (!error) setLoading(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Unable to initialize payment.",
      });
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (loading) return;
    const { error } = await presentPaymentSheet();
    if (error) {
      Toast.show({
        type: "error",
        text1: "Payment Failed!",
        text2: error.message,
      });
    } else {
      await apiClient.post(`${apiBaseUrl}/payment/update-status`, {
        paymentId,
        status: "succeeded",
      });
      await handleTicketGeneration();
    }
  };

  const handleTicketGeneration = async () => {
    if (!selectedSeats || selectedSeats.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Seats Selected",
        text2: "Please select at least one seat.",
      });
      return;
    }

    try {
      const seatPayload = {
        busId,
        seatsData: selectedSeats.map((seat) => ({
          seatNumber: seat.seatNumber,
          booked: true,
          email: email,
          gender: seat?.gender,
        })),
      };
      await apiClient.patch(`/bus/update-seat-status`, seatPayload);

      const ticketBody = {
        tickets: selectedSeats.map((seat) => ({
          userId: userId,
          busId: busId,
          seatNumber: seat.seatNumber,
        })),
      };
      await axios.post(`${apiBaseUrl}/ticket/generate`, ticketBody);

      Toast.show({
        type: "success",
        text2: "Your ticket has been successfully generated.",
      });

      // 🎉 Trigger confetti from parent
      if (onSuccess) onSuccess();

      navigation.navigate("MainTabs", { screen: "Ticket" });
    } catch (error) {
      console.error("Error generating tickets:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong while booking tickets.",
      });
    }
  };

  return (
    <View>
      <AppButton text="Pay Now" onPress={openPaymentSheet} disabled={loading} />
    </View>
  );
};

export default Payment;
