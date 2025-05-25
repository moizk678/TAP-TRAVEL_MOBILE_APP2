import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as Location from "expo-location";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "react-native-vector-icons";

import AppButton from "../../Components/Button";
import GlobalRefreshWrapper from "../../Components/GlobalRefreshWrapper";
import { apiBaseUrl } from "../../config/urls";
import apiClient from "../../api/apiClient";
import { formatDate } from "../../utils/helperFunction";
import { busStatuses } from "../../utils/bus-statuses";
import { useTheme } from "../../theme/theme";
import LottieView from 'lottie-react-native';
import TicketLoadingAnimation from '../../../assets/animations/TicketLoading.json';

const ActiveTicketsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTickets, setAllTickets] = useState({ active: [], past: [] });

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.log("No authentication token found");
        setLoading(false);
        return;
      }
      
      const decoded = jwtDecode(token);
      const userId = decoded?.sub || decoded?.userId || decoded?.id || decoded?._id;
      
      if (!userId) {
        console.log("No user ID could be extracted from token");
        setLoading(false);
        return;
      }
      
      console.log(`Fetching tickets for userId: ${userId}`);
      // Use the same endpoint as in checkCancelledTickets
      const { data } = await apiClient.get(`/ticket/user/information/${userId}`);
      
      console.log("Tickets response structure:", Object.keys(data));
      
      // Store all tickets for potential future use
      setAllTickets(data);
      
      // Filter active non-cancelled tickets
      const activeNonCancelled = (data?.active || []).filter(
        (ticket) => ticket.status !== "cancelled" && ticket.ticketStatus !== "cancelled"
      );
      
      console.log(`Found ${activeNonCancelled.length} active non-cancelled tickets`);
      setActiveTickets(activeNonCancelled);
    } catch (error) {
      console.error("Failed to fetch tickets:", error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  // Custom refresh function for the GlobalRefreshWrapper
  const handleRefresh = async () => {
    console.log("Refreshing tickets data...");
    await fetchUserTickets();
  };

  const processedTickets = activeTickets.map((ticket) => {
    const today = new Date();
    const ticketDate = new Date(ticket?.date);
    const isToday = ticketDate.toDateString() === today.toDateString();

    let shouldShowNavigationButton = false;
    if (
      isToday &&
      ticket?.status === "scanned" &&
      ticket?.busStatus === busStatuses.IN_TRANSIT
    ) {
      shouldShowNavigationButton = true;
    }

    return { ...ticket, shouldShowNavigationButton };
  });

  const handleChoose = async (ticket) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      const payload = {
        userId: ticket?.userId,
        busId: ticket?.busId,
        currentLocation,
        route: {
          ...ticket?.route,
          stops: ticket?.route?.stops?.map((stop) => ({ ...stop })),
        },
      };

      await apiClient.post("/ticket/schedule-notifications", payload);

      navigation.navigate("TrackLocation", { busId: ticket?.busId });
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      navigation.navigate("TrackLocation", { busId: ticket?.busId });
      alert("Failed to schedule notifications. Please try again.");
    }
  };

  const renderHeaderWithIcon = (title, icon) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.basic}50` }]}>
        <MaterialIcons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderTicketStatusBadge = (status) => {
    let badgeStyle = styles.statusBadge;
    let textStyle = styles.statusText;
    let statusText = status || "Unknown";

    switch (status?.toLowerCase()) {
      case "active":
        badgeStyle = {...badgeStyle, backgroundColor: `${theme.colors.green}20`};
        textStyle = {...textStyle, color: theme.colors.green};
        statusText = "Active";
        iconName = "check-circle";
        break;
      case "scanned":
        badgeStyle = {...badgeStyle, backgroundColor: `${theme.colors.primary}20`};
        textStyle = {...textStyle, color: theme.colors.primary};
        statusText = "Scanned";
        iconName = "qr-code-scanner";
        break;
      default:
        badgeStyle = {...badgeStyle, backgroundColor: "#64748B20"};
        textStyle = {...textStyle, color: "#64748B"};
    }

    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{statusText}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Active Tickets</Text>
      </View>
      
      <GlobalRefreshWrapper
        onRefresh={handleRefresh}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View animation="fadeIn" duration={800}>
          <View style={[styles.bannerContainer, { backgroundColor: "#E8E8F0" }]}>
            <View style={styles.bannerTextContainer}>
              <Text style={[styles.bannerTitle, { color: "#1E293B" }]}>Active Journeys</Text>
              <Text style={[styles.bannerSubtitle, { color: "#64748B" }]}>
                Track and manage your trips
              </Text>
            </View>
            <View style={[styles.busIconContainer, { backgroundColor: "rgba(41, 41, 102, 0.1)" }]}>
              <MaterialIcons name="directions-bus" size={32} color={theme.colors.primary} />
            </View>
          </View>
        </Animatable.View>

        {loading ? (
<View style={styles.loadingContainer}>
    <LottieView
      source={TicketLoadingAnimation}
      autoPlay
      loop
      style={{ width: 120, height: 120 }}
    />
    <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
      Loading your tickets...
    </Text>
  </View>
        ) : processedTickets.length > 0 ? (
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.ticketsContainer}>
              {renderHeaderWithIcon("Choose Your Route", "map")}
              
              {processedTickets.map((ticket, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInUp"
                  delay={index * 100}
                  style={styles.ticketCard}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.routeContainer}>
                      {ticket.route ? (
                        <>
                          <Text style={styles.cityText}>{ticket?.route?.startCity}</Text>
                          <View style={styles.arrowContainer}>
                            <View style={styles.arrowLine}></View>
                            <MaterialIcons name="arrow-forward" size={16} color={theme.colors.primary} />
                            <View style={styles.arrowLine}></View>
                          </View>
                          <Text style={styles.cityText}>{ticket?.route?.endCity}</Text>
                        </>
                      ) : (
                        <Text style={styles.routeUnavailable}>Route information is unavailable</Text>
                      )}
                    </View>
                    {renderTicketStatusBadge(ticket?.status || ticket?.ticketStatus)}
                  </View>
                  
                  <View style={styles.ticketInfoContainer}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <MaterialIcons name="event" size={16} color="#64748B" />
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{formatDate(ticket?.date)}</Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <MaterialIcons name="directions-bus" size={16} color="#64748B" />
                        <Text style={styles.infoLabel}>Bus</Text>
                        <Text style={styles.infoValue}>{ticket?.busDetails?.busNumber || "N/A"}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: "https://t4.ftcdn.net/jpg/02/69/47/51/360_F_269475198_k41qahrZ1j4RK1sarncMiFHpcmE2qllQ.jpg",
                      }}
                      style={styles.busImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  {ticket.shouldShowNavigationButton && (
                    <AppButton
                      text="Start Navigation"
                      onPress={() => handleChoose(ticket)}
                      variant="primary"
                      style={styles.navigationButton}
                    />
                  )}
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeIn" duration={800} delay={200}>
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="confirmation-number" size={70} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Active Tickets</Text>
              <Text style={styles.emptyStateMessage}>You don't have any active tickets at the moment.</Text>
              <AppButton
                text="Book a New Trip"
                onPress={() => navigation.navigate("Home")}
                variant="primary"
                style={styles.bookButton}
              />
            </View>
          </Animatable.View>
        )}
      </GlobalRefreshWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  bannerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    height: 80,
  },
  bannerTextContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
  },
  busIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  ticketsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    margin: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  ticketCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  arrowLine: {
    height: 1,
    backgroundColor: "#CBD5E1",
    width: 10,
  },
  routeUnavailable: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ticketInfoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    height: 150,
    marginBottom: 12,
  },
  busImage: {
    width: "100%",
    height: "100%",
  },
  navigationButton: {
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  bookButton: {
    width: "80%",
  },
});

export default ActiveTicketsScreen;