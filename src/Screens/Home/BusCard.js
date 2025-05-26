import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from "react-native";
import { format12time, formatDate } from "../../utils/helperFunction";
import { getTimeDifference } from "../../utils/get-time-difference";
import { MaterialIcons } from "react-native-vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../../theme/theme";

// RFID Status Context
export const RFIDStatusContext = React.createContext({
  rfidStatus: null,
});

// RFID Warning Card Component
const RFIDWarningCard = ({ theme }) => (
  <Animatable.View animation="fadeInDown" duration={600}>
    <View style={[styles.warningCard, { 
      backgroundColor: "#FFF3CD",
      borderColor: "#FFEAA7",
      shadowColor: theme.colors.primary
    }]}>
      <View style={styles.warningContent}>
        <MaterialIcons name="info" size={20} color="#856404" />
        <View style={styles.warningTextContainer}>
          <Text style={styles.warningTitle}>RFID Card Required</Text>
          <Text style={styles.warningMessage}>
            Please wait for your RFID card to be delivered before booking tickets.
          </Text>
        </View>
      </View>
    </View>
  </Animatable.View>
);

const BusCard = ({ bus, index, onBook, showRFIDWarning = false }) => {
  const { theme } = useTheme();
  const { rfidStatus } = useContext(RFIDStatusContext);
  const [scale] = useState(new Animated.Value(1));

  // Determine if booking should be disabled
  const isBookingDisabled = rfidStatus === 'booked';

  const handleBookTicket = () => {
    if (onBook && !isBookingDisabled) {
      onBook(bus._id);
    }
  };

  const handlePressIn = () => {
    if (!isBookingDisabled) {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isBookingDisabled) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View>
      {/* RFID Warning Card - only show for first bus card and when RFID status is 'booked' */}
      {showRFIDWarning && isBookingDisabled && (
        <RFIDWarningCard theme={theme} />
      )}

      <Animatable.View animation="fadeIn" duration={600} delay={index * 100}>
        <View style={[
          styles.card, 
          { 
            backgroundColor: "#F6F7FF",
            shadowColor: theme.colors.primary,
            borderColor: theme.colors.tertiary,
            opacity: isBookingDisabled ? 0.7 : 1
          }
        ]}>
          {/* Bus Operator Badge */}
          <View style={[styles.badgeContainer, { backgroundColor: theme.colors.basic }]}>
            <MaterialIcons name="directions-bus" size={16} color={theme.colors.primary} />
            <Text 
              style={[styles.badgeText, { color: theme.colors.primary }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {bus?.adminName}
            </Text>
          </View>

          {/* Route Information */}
          <View style={styles.routeContainer}>
            {/* Departure */}
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>{format12time(bus?.departureTime)}</Text>
              <Text 
                style={styles.cityText} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {bus?.route?.startCity}
              </Text>
              <Text style={styles.dateText}>{formatDate(bus?.date)}</Text>
            </View>

            {/* Journey Visual */}
            <View style={styles.journeyVisual}>
              <View style={[styles.startDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.journeyLine, { backgroundColor: theme.colors.tertiary }]} />
              <View style={[styles.durationBadge, { backgroundColor: theme.colors.basic }]}>
                <Text style={[styles.durationText, { color: theme.colors.primary }]}>
                  {getTimeDifference(bus?.departureTime, bus?.arrivalTime)}
                </Text>
              </View>
              <View style={[styles.journeyLine, { backgroundColor: theme.colors.tertiary }]} />
              <View style={[styles.endDot, { backgroundColor: theme.colors.primary }]} />
            </View>

            {/* Arrival */}
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>{format12time(bus?.arrivalTime)}</Text>
              <Text 
                style={styles.cityText} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {bus?.route?.endCity}
              </Text>
              <Text style={styles.dateText}>{formatDate(bus?.date)}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.tertiary }]} />

          {/* Bus Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialIcons name="attach-money" size={14} color={theme.colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>
                <Text style={styles.detailLabel}>Price: </Text>
                <Text style={styles.detailValue}>PKR {bus?.fare?.actualPrice}</Text>
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="airline-seat-recline-normal" size={14} color={theme.colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>
                <Text style={styles.detailLabel}>Seats: </Text>
                <Text style={styles.detailValue}>{bus?.busDetails?.busCapacity || "N/A"}</Text>
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="place" size={14} color={theme.colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>
                <Text style={styles.detailLabel}>Stops: </Text>
                <Text style={styles.detailValue}>{bus?.route?.stops?.length || 0}</Text>
              </Text>
            </View>
          </View>

          {/* Bus Type Badge */}
          <View style={[styles.busTypeBadge, { backgroundColor: theme.colors.basic }]}>
            <MaterialIcons name="stars" size={14} color={theme.colors.primary} />
            <Text style={[styles.busTypeText, { color: theme.colors.primary }]} numberOfLines={1}>
              {bus?.busDetails?.standard?.toUpperCase() || "STANDARD"}
            </Text>
          </View>

          {/* Book Button */}
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              style={[
                styles.bookButton, 
                { 
                  backgroundColor: isBookingDisabled ? '#CCCCCC' : theme.colors.primary,
                  height: 48,
                  borderRadius: 30,
                  ...Platform.select({
                    android: {
                      elevation: isBookingDisabled ? 1 : 4,
                    },
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: isBookingDisabled ? 1 : 3 },
                      shadowOpacity: isBookingDisabled ? 0.1 : 0.15,
                      shadowRadius: isBookingDisabled ? 2 : 6,
                    },
                  }),
                }
              ]}
              onPress={handleBookTicket}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={isBookingDisabled ? 1 : 0.9}
              disabled={isBookingDisabled}
            >
              <MaterialIcons 
                name={isBookingDisabled ? "block" : "confirmation-number"} 
                size={18} 
                color={isBookingDisabled ? "#999999" : "#FFFFFF"} 
              />
              <Text style={[
                styles.bookButtonText,
                { color: isBookingDisabled ? "#999999" : "#FFFFFF" }
              ]}>
                {isBookingDisabled ? "Booking Unavailable" : "Book Ticket"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animatable.View>
    </View>
  );
};

export default BusCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },

    warningCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: "80%",
  },
  badgeText: {
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
    flexShrink: 1,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeBlock: {
    flex: 3.5,
    paddingRight: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  cityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
    flexShrink: 1,
    width: "100%",
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
  },
  journeyVisual: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  journeyLine: {
    flex: 1,
    height: 1,
  },
  durationBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 2,
    flexShrink: 0,
  },
  durationText: {
    fontSize: 10,
    fontWeight: "600",
  },
  endDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "30%",
    marginRight: 8,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#334155",
    flexShrink: 1,
  },
  detailLabel: {
    fontWeight: "400",
    color: "#64748B",
  },
  detailValue: {
    fontWeight: "600",
    color: "#334155",
  },
  busTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: "50%",
  },
  busTypeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    flexShrink: 1,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0.6,
  },
});