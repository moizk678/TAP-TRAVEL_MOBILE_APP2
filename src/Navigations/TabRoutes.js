import React from "react";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "react-native-vector-icons";
import { View, StyleSheet, Animated, Text, Platform } from "react-native";
import { Home, Profile, Ticket } from "../";
import MapStack from "./MapStack";
import { useTheme } from "../theme/theme";

const BottomTab = createBottomTabNavigator();

// Custom tab indicator that uses theme colors
const CustomTabBar = (props) => {
  const { state } = props;
  const { theme } = useTheme();
  
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.indicatorContainer}>
        <View 
          style={[
            styles.indicator, 
            { 
              width: `${100 / state.routes.length}%`,
              left: `${(100 / state.routes.length) * state.index}%`,
              backgroundColor: theme.colors.primary, // Use theme primary color
            }
          ]}
        />
      </View>
      <BottomTabBar {...props} />
    </View>
  );
};

const TabRoutes = () => {
  const { theme } = useTheme();

  return (
    <BottomTab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tertiary,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: "#FFFFFF", // Keep white background for contrast
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        // Add bottom padding to content to prevent tab bar overlap
        contentStyle: {
          paddingBottom: 65, // Match the height of the tab bar
        }
      }}
    >
      <BottomTab.Screen 
        name="Home" 
        component={Home} 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="home" 
                size={focused ? size + 2 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <BottomTab.Screen 
        name="Ticket" 
        component={Ticket} 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="confirmation-number"
                size={focused ? size + 2 : size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <BottomTab.Screen 
        name="Map" 
        component={MapStack} 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="location-on" 
                size={focused ? size + 2 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <BottomTab.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="person" 
                size={focused ? size + 2 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "relative",
    backgroundColor: "transparent",
  },
  tabBar: {
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 24,
  },
  indicatorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 3,
  },
  indicator: {
    height: 3,
    borderRadius: 8,
    position: "absolute",
    top: 0,
    transition: "left 0.3s ease",
  },
});

export default TabRoutes;