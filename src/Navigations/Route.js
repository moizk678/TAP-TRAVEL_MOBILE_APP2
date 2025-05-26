import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';
import MainStack from './MainStack';
import AuthStack from './AuthStack';
import Rfid from '../Screens/Profile/Rfid';
import { RFIDStatusContext } from '../Screens/Home/BusCard'; // Import the context

// Create a special context just for the RFID flow
export const RFIDNavigationContext = React.createContext({
  setRFIDComplete: () => {},
});

const Stack = createStackNavigator();

export default function Routes() {
  const { isAuthenticated, setIsAuthenticated } = React.useContext(AuthContext);
  const [needsRFID, setNeedsRFID] = useState(false);
  const [rfidStatus, setRfidStatus] = useState(null); // Track RFID status
  const [loading, setLoading] = useState(true);
  
  // Function to mark RFID as complete and update navigation state
  const setRFIDComplete = async () => {
    try {
      // Save RFID status to AsyncStorage
      await AsyncStorage.setItem('RFIDCardStatus', 'booked');
      
      // Update the RFID status in state
      setRfidStatus('booked');
      
      // Update the state directly without trying to manipulate authentication
      setNeedsRFID(false);
    } catch (error) {
      console.error('Error in setRFIDComplete:', error);
    }
  };

  useEffect(() => {
    const fetchRFIDStatus = async () => {
      try {
        if (isAuthenticated) {
          // Always check with API first for authenticated users
          const token = await AsyncStorage.getItem('token');
          if (token) {
            const decoded = jwtDecode(token);
            const userId = decoded.sub;
            
            try {
              const response = await apiClient.get(`/user/${userId}`);
              const status = response?.data?.user?.RFIDCardStatus;
              
              console.log("RFID Card Status from API:", status);
              
              // Update RFID status in state
              setRfidStatus(status);
              
              // Check if user needs RFID card based on API response
              if (status === 'pending' || !status) {
                console.log("User needs RFID - showing RFID screen");
                // Clear any potentially incorrect cached status
                await AsyncStorage.removeItem('RFIDCardStatus');
                setNeedsRFID(true);
              } else if (status === 'booked') {
                console.log("User has booked RFID - showing main app");
                // Cache the confirmed status for future reference
                await AsyncStorage.setItem('RFIDCardStatus', 'booked');
                setNeedsRFID(false);
              } else if (status === 'delivered') {
                console.log("User has RFID - showing main app");
                // Cache the confirmed status for future reference
                await AsyncStorage.setItem('RFIDCardStatus', 'delivered');
                setNeedsRFID(false);
              }

              
            } catch (apiError) {
              console.error('API error fetching RFID status:', apiError);
              
              // Fallback to cache only if API request fails
              console.log('Falling back to cached RFID status');
              const cachedStatus = await AsyncStorage.getItem('RFIDCardStatus');
              setRfidStatus(cachedStatus);
              setNeedsRFID(cachedStatus !== 'booked');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching RFID status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRFIDStatus();
  }, [isAuthenticated]);

  if (loading) return null; // or a loading spinner

  // Create a wrapped version of the RFID screen with navigation context
  const RfidWithContext = (props) => (
    <RFIDNavigationContext.Provider value={{ setRFIDComplete }}>
      <Rfid {...props} />
    </RFIDNavigationContext.Provider>
  );

  // Wrap MainStack with RFID Status Context
  const MainStackWithRFIDContext = () => (
    <RFIDStatusContext.Provider value={{ rfidStatus }}>
      <MainStack />
    </RFIDStatusContext.Provider>
  );

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : needsRFID ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RfidScreen" component={RfidWithContext} />
        </Stack.Navigator>
      ) : (
        <MainStackWithRFIDContext />
      )}
    </NavigationContainer>
  );
}