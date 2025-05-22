import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { formatTime } from "../../utils/format-time";
import { getCityShortForm } from "../../utils/get-city-short-form";
import { getTimeDifference } from "../../utils/get-time-difference";
import { formatDateToDayMonth } from "../../utils/format-date-to-day-month";
import { extractSeatNumber } from "../../utils/extract-seat-number";

const TicketCard = ({ ticket, onDelete, isActiveTicket, canCancel, theme }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const genderText = ticket?.seatDetails?.gender === "M" ? "Male" : "Female";
  const genderColor =
    ticket?.seatDetails?.gender === "M" ? "#27ae60" : "#e84393"; // green / pink

  // Calculate hours until departure for display
  const getHoursUntilDeparture = () => {
    if (!ticket.date || !ticket.departureTime) return 0;
    
    const ticketDate = new Date(ticket.date);
    const [hours, minutes] = ticket.departureTime.split(':').map(Number);
    
    const departureDateTime = new Date(ticketDate);
    departureDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const timeDifference = departureDateTime.getTime() - now.getTime();
    const hoursUntilDeparture = timeDifference / (1000 * 60 * 60);
    
    return Math.max(0, hoursUntilDeparture);
  };

  const handleDeletePress = () => {
    if (canCancel) {
      onDelete(ticket);
    }
  };

  const handleInfoPress = () => {
    setShowInfoModal(true);
  };

  // Info Modal Component
  const InfoModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showInfoModal}
      onRequestClose={() => setShowInfoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300} 
          style={styles.infoModalContainer}
        >
          <View style={styles.infoModalHeader}>
            <MaterialIcons name="info" size={24} color="#292966" />
            <Text style={styles.infoModalTitle}>Cancellation Policy</Text>
            <TouchableOpacity 
              onPress={() => setShowInfoModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalText}>
              Tickets cannot be cancelled when there is less than 1 hour remaining until departure.
            </Text>
            
            {!canCancel && (
              <View style={styles.timeInfoContainer}>
                <MaterialIcons name="schedule" size={16} color="#e74c3c" />
                <Text style={styles.timeInfoText}>
                  Only {getHoursUntilDeparture().toFixed(1)} hours remaining until departure
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.infoModalButton}
            onPress={() => setShowInfoModal(false)}
          >
            <Text style={styles.infoModalButtonText}>Got it</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{ticket?.adminName}</Text>
        <View style={styles.seatContainer}>
          <MaterialCommunityIcons name="seat-passenger" size={20} color="#fff" />
          <View style={styles.seatCircle}>
            <Text style={styles.seatText}>
              {extractSeatNumber(ticket?.seatNumber)}
            </Text>
          </View>
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeContainer}>
        {/* Departure */}
        <View style={styles.pointBlock}>
          <Text style={styles.time}>{formatTime(ticket?.departureTime)}</Text>
          <Text style={styles.date}>{formatDateToDayMonth(ticket?.date)}</Text>
          <Text style={styles.cityCode}>{getCityShortForm(ticket?.route?.startCity)}</Text>
          <Text style={styles.cityFull}>{ticket?.route?.startCity}</Text>
        </View>

        {/* Flight Duration & Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.duration}>
            {getTimeDifference(ticket?.departureTime, ticket?.arrivalTime)}
          </Text>
          <View style={styles.arrowLine}>
            <View style={styles.circle} />
            <View style={styles.dash} />
            <AntDesign name="arrowright" size={20} color="#fff" />
          </View>
        </View>

        {/* Arrival */}
        <View style={styles.pointBlock}>
          <Text style={styles.time}>{formatTime(ticket?.arrivalTime)}</Text>
          <Text style={styles.date}>{formatDateToDayMonth(ticket?.date)}</Text>
          <Text style={styles.cityCode}>{getCityShortForm(ticket?.route?.endCity)}</Text>
          <Text style={styles.cityFull}>{ticket?.route?.endCity}</Text>
        </View>
      </View>

      {/* Dashed Divider */}
      <View style={styles.divider} />

      {/* Fare */}
      <View style={styles.fareSection}>
        <Text style={styles.fareLabel}>Ticket Price</Text>
        <Text style={styles.fare}>PKR {ticket?.fare?.actualPrice}</Text>
      </View>

      {/* Passenger */}
      <View style={styles.passengerSection}>
        <Text style={styles.passengerText}>
          {extractSeatNumber(ticket?.seatNumber)}. {ticket?.user}
        </Text>
        <View style={[styles.badge, { backgroundColor: genderColor }]}>
          <Text style={styles.badgeText}>{genderText}</Text>
        </View>
      </View>

      {/* Cancel Button - Only shown for active tickets */}
{isActiveTicket && (
  <TouchableOpacity 
    style={[
      styles.deleteButton, 
      !canCancel && styles.disabledDeleteButton // grey background when disabled
    ]} 
    onPress={handleDeletePress}
    activeOpacity={canCancel ? 0.7 : 1}
    disabled={!canCancel}
  >
    <Feather 
      name="x-circle" 
      size={18} 
      color={canCancel ? "#fff" : "#999999"} // grey icon when disabled
    />
    <Text style={[
      styles.deleteText,
      !canCancel && styles.disabledDeleteText // grey text when disabled
    ]}>
      Cancel Booking
    </Text>

    {/* Info Icon */}
    <TouchableOpacity 
      style={[
        styles.infoIconContainer,
        !canCancel && styles.prominentInfoIcon
      ]}
      onPress={handleInfoPress}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name="info-outline" 
        size={canCancel ? 18 : 20} 
        color={canCancel ? "rgba(255,255,255,0.8)" : "#666666"} // grey info icon when disabled
      />
    </TouchableOpacity>
  </TouchableOpacity>
)}


      {/* Decorative Cutouts */}
      <View style={styles.cutoutLeft} />
      <View style={styles.cutoutRight} />
      
      {/* Info Modal */}
      <InfoModal />
    </View>
  );
};

export default TicketCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#292966",
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    overflow: "visible",
    position: "relative",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  infoModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  infoModalContent: {
    marginBottom: 20,
  },
  infoModalText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 15,
  },
  timeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  timeInfoText: {
    fontSize: 14,
    color: "#c62828",
    marginLeft: 8,
    fontWeight: "500",
  },
  infoModalButton: {
    backgroundColor: "#292966",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  infoModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seatContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seatCircle: {
    backgroundColor: "#5c5c99",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  seatText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  routeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  pointBlock: {
    alignItems: "center",
    width: "30%",
  },
  time: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  date: {
    color: "#ddd",
    fontSize: 14,
    marginVertical: 2,
  },
  cityCode: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
  cityFull: {
    color: "#bbb",
    fontSize: 12,
  },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "35%",
  },
  duration: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 12,
  },
  arrowLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  dash: {
    width: 40,
    height: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fff",
    marginHorizontal: 6,
  },
  divider: {
    marginVertical: 20,
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: "#aaa",
  },
  fareSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 12,
    color: "#bbb",
  },
  fare: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#41E0A8",
    marginTop: 4,
  },
  passengerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderColor: "#444",
    paddingTop: 10,
  },
  passengerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 15,
    gap: 6,
  },

    disabledDeleteButton: {
    backgroundColor: "#cccccc", // light grey background when disabled
  },

    disabledDeleteText: {
    color: "#666666", // dark grey text when disabled
  },
  
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cutoutLeft: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    left: -10,
    top: "50%",
    marginTop: -10,
  },
  cutoutRight: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    right: -10,
    top: "50%",
    marginTop: -10,
  },
});