import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabRoutes from "./TabRoutes";
import BookTicket from "../Screens/BookTicket/BookTicket";
import PaymentScreen from "../Screens/Payment/PaymentScreen";
import BookingForm from "../Screens/Home/Home";
import Rfid from "../Screens/Profile/Rfid";

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabRoutes} />
      <Stack.Screen name="BookTicket" component={BookTicket} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="Home" component={BookingForm} />
      <Stack.Screen name="Rfid" component={Rfid} />
    </Stack.Navigator>
  );
};

export default MainStack;