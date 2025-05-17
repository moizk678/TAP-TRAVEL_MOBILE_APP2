import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import TicketCard from "./TicketCard";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../../theme/theme";
import { MaterialIcons } from "react-native-vector-icons";

const { width } = Dimensions.get("window");

const Ticket = () => {
  const { theme } = useTheme();
  const [tickets, setTickets] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [ticketToDeleteDetails, setTicketToDeleteDetails] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return console.warn("Token not found!");
      const decoded = jwtDecode(token);
      const userId = decoded?.sub;
      if (!userId) return console.warn("UserId not found in token!");

      const { data } = await apiClient(`/ticket/user/information/${userId}`);
      setTickets(data);
      filterTickets(data, selectedTab);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets(tickets, selectedTab);
  }, [selectedTab, tickets]);

  const filterTickets = (ticketsList, tab) => {
    if (!ticketsList) {
      setFilteredTickets([]);
      return;
    }

    let filtered = [];

    if (tab === "active") {
      filtered = (ticketsList.active || []).filter(
        (ticket) => ticket.ticketStatus !== "cancelled"
      );
    } else if (tab === "past") {
      filtered = (ticketsList.past || []).filter(
        (ticket) => ticket.ticketStatus !== "cancelled"
      );
    } else if (tab === "cancelled") {
      const activeCancelled = (ticketsList.active || []).filter(
        (ticket) => ticket.ticketStatus === "cancelled"
      );
      const pastCancelled = (ticketsList.past || []).filter(
        (ticket) => ticket.ticketStatus === "cancelled"
      );
      filtered = [...activeCancelled, ...pastCancelled];
    }

    setFilteredTickets(filtered);
  };

  const initiateDeleteProcess = (ticket) => {
    if (!ticket || !ticket._id) {
      console.warn("Invalid ticket provided for deletion");
      return;
    }
    
    setTicketToDelete(ticket._id);
    setTicketToDeleteDetails(ticket);
    setConfirmModalVisible(true);
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) {
      setConfirmModalVisible(false);
      return;
    }

    try {
      setConfirmModalVisible(false);
      setDeleteLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found");
        setDeleteLoading(false);
        return;
      }

      await apiClient.put(
        `/ticket/cancel/${ticketToDelete}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchTickets();
      setDeleteLoading(false);
      setSuccessModalVisible(true);
      
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      setDeleteLoading(false);
    }
  };

  // Custom Confirmation Modal
  const ConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300} 
          style={styles.confirmModalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.confirmModalTitle, { color: "#FFFFFF" }]}>
              Cancel Booking
            </Text>
          </View>
          
          <View style={styles.confirmModalContent}>
            <View style={styles.warningIconContainer}>
              <MaterialIcons name="warning" size={32} color="#FFFFFF" />
            </View>
            
            <Text style={styles.confirmModalText}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Text>
            
            {ticketToDeleteDetails && (
              <View style={[
                styles.ticketInfoContainer, 
                { 
                  backgroundColor: `${theme.colors.tertiary}20`, 
                  borderLeftColor: theme.colors.primary
                }
              ]}>
                <MaterialIcons name="event" size={18} color={theme.colors.primary} style={styles.ticketInfoIcon} />
                <View style={styles.ticketInfoTextContainer}>
                  {ticketToDeleteDetails.eventName && (
                    <Text style={styles.ticketInfoTitle}>
                      {ticketToDeleteDetails.eventName}
                    </Text>
                  )}
                  {ticketToDeleteDetails.date && (
                    <Text style={styles.ticketInfoDate}>
                      {new Date(ticketToDeleteDetails.date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            )}
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Keep Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: theme.colors.danger || "#E74C3C" }]}
                onPress={handleDeleteTicket}
              >
                <Text style={styles.confirmButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Success Modal
  const SuccessModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={successModalVisible}
      onRequestClose={() => setSuccessModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300} 
          style={styles.successModalContainer}
        >
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={60} color={theme.colors.green} />
          </View>
          
          <Text style={[styles.successModalTitle, { color: theme.colors.primary }]}>
            Booking Cancelled
          </Text>
          
          <Text style={styles.successModalText}>
            Your booking has been successfully cancelled.
          </Text>
          
          <TouchableOpacity 
            style={[styles.dismissButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setSuccessModalVisible(false)}
          >
            <Text style={styles.dismissButtonText}>Close</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Convert tab text to icon
  const getTabIcon = (tab) => {
    switch(tab) {
      case 'active':
        return 'confirmation-number';
      case 'past':
        return 'history';
      case 'cancelled':
        return 'cancel';
      default:
        return 'confirmation-number';
    }
  };

  // Get count badges for tabs
  const getTicketCount = (tab) => {
    if (!tickets) return 0;
    
    switch(tab) {
      case 'active':
        return (tickets.active || []).filter(t => t.ticketStatus !== "cancelled").length;
      case 'past':
        return (tickets.past || []).filter(t => t.ticketStatus !== "cancelled").length;
      case 'cancelled':
        const activeCancelled = (tickets.active || []).filter(t => t.ticketStatus === "cancelled").length;
        const pastCancelled = (tickets.past || []).filter(t => t.ticketStatus === "cancelled").length;
        return activeCancelled + pastCancelled;
      default:
        return 0;
    }
  };

  const renderEmptyState = () => (
    <Animatable.View 
      animation="fadeIn" 
      duration={800} 
      style={styles.emptyStateContainer}
    >
      <View style={styles.emptyStateIconContainer}>
        <MaterialIcons 
          name={selectedTab === "active" ? "confirmation-number" : 
                selectedTab === "past" ? "history" : "block"} 
          size={70} 
          color={`${theme.colors.tertiary}80`}
        />
      </View>
      
      <Text style={[styles.emptyStateTitle, { color: theme.colors.primary }]}>
        No {selectedTab} tickets
      </Text>
      
      <Text style={styles.emptyStateText}>
        {selectedTab === "active" 
          ? "You don't have any active bookings at the moment." 
          : selectedTab === "past" 
            ? "Your past trips will appear here." 
            : "You haven't cancelled any bookings yet."}
      </Text>
      
      {selectedTab !== "active" && (
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setSelectedTab("active")}
        >
          <Text style={styles.emptyStateButtonText}>Go to Active Tickets</Text>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#f8fafc" }]}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Header Section */}
        <Animatable.View animation="fadeIn" duration={800} style={styles.headerSection}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>My Tickets</Text>
            <Text style={styles.headerSubtitle}>View and manage your bookings</Text>
          </View>
          
          <View style={[styles.headerIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <MaterialIcons name="receipt-long" size={26} color={theme.colors.primary} />
          </View>
        </Animatable.View>

        {/* Tabs Container */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.tabsOuterContainer}>
            <View style={styles.tabsContainer}>
              {['active', 'past', 'cancelled'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.customTabButton,
                    selectedTab === tab 
                      ? [styles.activeTab, { backgroundColor: theme.colors.primary }] 
                      : styles.inactiveTab,
                  ]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <MaterialIcons 
                    name={getTabIcon(tab)} 
                    size={20} 
                    color={selectedTab === tab ? "#FFFFFF" : theme.colors.secondary} 
                    style={styles.tabIcon}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === tab 
                        ? styles.activeTabText
                        : [styles.inactiveTabText, { color: theme.colors.secondary }],
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                  
 
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animatable.View>

        {/* Content Area */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
              Loading your tickets...
            </Text>
          </View>
        ) : deleteLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
              Cancelling your booking...
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Animatable.View animation="fadeInUp" duration={700} delay={250} style={{ flex: 1 }}>
              <FlatList
                data={filteredTickets}
                keyExtractor={(item, index) => `${item._id}_${index}`}
                renderItem={({ item, index }) => (
                  <Animatable.View
                    animation="fadeInUp"
                    duration={400}
                    delay={index * 100}
                  >
                    <TicketCard
                      ticket={item}
                      onDelete={() => initiateDeleteProcess(item)}
                      isActiveTicket={selectedTab === "active"}
                      theme={theme}
                    />
                  </Animatable.View>
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
              />
            </Animatable.View>
          </View>
        )}
      </View>

      {/* Custom Modals */}
      <ConfirmationModal />
      <SuccessModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsOuterContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
customTabButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
  paddingHorizontal: 10, // increased for breathing room
  borderRadius: 10,
  marginHorizontal: 3,
  minWidth: 100, // ensure enough space for "Cancelled"
},

  activeTab: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inactiveTabText: {
    color: "#94A3B8",
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Confirmation Modal Styles
  confirmModalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmModalContent: {
    padding: 24,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  ticketInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
  },
  ticketInfoIcon: {
    marginRight: 10,
  },
  ticketInfoTextContainer: {
    flex: 1,
  },
  ticketInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  ticketInfoDate: {
    fontSize: 13,
    color: '#64748B',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Success Modal Styles
  successModalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  successModalText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  dismissButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  dismissButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Ticket;