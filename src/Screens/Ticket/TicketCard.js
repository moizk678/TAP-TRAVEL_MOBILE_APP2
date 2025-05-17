import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import { formatTime } from "../../utils/format-time";
import { getCityShortForm } from "../../utils/get-city-short-form";
import { getTimeDifference } from "../../utils/get-time-difference";
import { formatDateToDayMonth } from "../../utils/format-date-to-day-month";
import { extractSeatNumber } from "../../utils/extract-seat-number";

const TicketCard = ({ ticket, onDelete, isActiveTicket }) => {
  const genderText = ticket?.seatDetails?.gender === "M" ? "Male" : "Female";
  const genderColor =
    ticket?.seatDetails?.gender === "M" ? "#27ae60" : "#e84393"; // green / pink

  // MODIFIED: Directly call onDelete without showing Alert.alert
  const handleDeletePress = () => {
    // Call the parent component's onDelete function directly
    // This will trigger our custom modal instead of the default Alert
    onDelete(ticket);
  };

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

      {/* Delete Button - Only shown for active tickets */}
      {isActiveTicket && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeletePress}
          activeOpacity={0.7}
        >
          <Feather name="x-circle" size={18} color="#fff" />
          <Text style={styles.deleteText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}

      {/* Decorative Cutouts */}
      <View style={styles.cutoutLeft} />
      <View style={styles.cutoutRight} />
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