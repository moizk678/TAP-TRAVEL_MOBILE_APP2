import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import apiClient from "../../api/apiClient";
import TicketCard from "./TicketCard";
import * as Animatable from "react-native-animatable";

const Ticket = () => {
  const [tickets, setTickets] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  // Store ticket details for more informative confirmation dialog
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

  // This is the function we pass to TicketCard - MODIFIED to directly show our custom modal
  const initiateDeleteProcess = (ticket) => {
    if (!ticket || !ticket._id) {
      console.warn("Invalid ticket provided for deletion");
      return;
    }
    
    // Store both the ID and some details for display
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
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Cancel Booking</Text>
            
            <Text style={styles.confirmModalText}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Text>
            
            {ticketToDeleteDetails && ticketToDeleteDetails.eventName && (
              <View style={styles.ticketInfoContainer}>
                <Text style={styles.ticketInfoText}>
                  Event: {ticketToDeleteDetails.eventName}
                </Text>
                {ticketToDeleteDetails.date && (
                  <Text style={styles.ticketInfoText}>
                    Date: {new Date(ticketToDeleteDetails.date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>No, Keep It</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
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
          <View style={styles.successModalContent}>
            <Text style={styles.successModalIcon}>✓</Text>
            <Text style={styles.successModalTitle}>Booking Cancelled</Text>
            
            <Text style={styles.successModalText}>
              Your booking has been successfully cancelled.
            </Text>
            
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.dismissButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎫 My Tickets</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.customTabButton,
            selectedTab === "active" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.customTabButton,
            selectedTab === "past" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("past")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === "past" && styles.activeTabText,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.customTabButton,
            selectedTab === "cancelled" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("cancelled")}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === "cancelled" && styles.activeTabText,
            ]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2C3E50"
          style={{ marginTop: 40 }}
        />
      ) : deleteLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Cancelling your booking...</Text>
        </View>
      ) : (
        <Animatable.View animation="fadeInUp" duration={700} style={{ flex: 1 }}>
          <FlatList
            data={filteredTickets}
            keyExtractor={(item, index) => `${item._id}_${index}`}
            renderItem={({ item }) => (
              <TicketCard
                ticket={item}
                onDelete={() => initiateDeleteProcess(item)}
                isActiveTicket={selectedTab === "active"}
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={() => (
              <View style={styles.noTicketsContainer}>
                <Text style={styles.noTicketsText}>
                  No {selectedTab} tickets found.
                </Text>
              </View>
            )}
          />
        </Animatable.View>
      )}

      {/* Custom Modals */}
      <ConfirmationModal />
      <SuccessModal />
    </View>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 28,
    color: "#2C3E50",
    marginBottom: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  customTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 4,
    backgroundColor: "#E8EAF6",
  },
  activeTabButton: {
    backgroundColor: "#3F51B5",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C6BC0",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  noTicketsContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  noTicketsText: {
    color: "#95A5A6",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#2C3E50",
    fontSize: 16,
  },
  
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Confirmation Modal Styles
  confirmModalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E74C3C',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmModalContent: {
    padding: 22,
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  ticketInfoContainer: {
    backgroundColor: '#F9EBEA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  ticketInfoText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
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
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  successModalIcon: {
    fontSize: 50,
    color: '#2ECC71',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 12,
  },
  successModalText: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  dismissButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});