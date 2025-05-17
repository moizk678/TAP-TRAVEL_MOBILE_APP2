import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from "react-native";
import { format12time, formatDate } from "../../utils/helperFunction";
import { getTimeDifference } from "../../utils/get-time-difference";
import { MaterialIcons } from "react-native-vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../../theme/theme";

const BusCard = ({ bus, index, onBook }) => {
  const { theme } = useTheme();
  const [scale] = useState(new Animated.Value(1));

  const handleBookTicket = () => {
    if (onBook) {
      onBook(bus._id);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animatable.View animation="fadeIn" duration={600} delay={index * 100}>
      <View style={[styles.card, { 
        backgroundColor: "#F6F7FF",
        shadowColor: theme.colors.primary,
        borderColor: theme.colors.tertiary
      }]}>
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

        {/* Book Button - Using AppButton styling approach */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={[styles.bookButton, { 
              backgroundColor: theme.colors.primary,
              height: 48,
              borderRadius: 30,
              ...Platform.select({
                android: {
                  elevation: 4,
                },
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                },
              }),
            }]}
            onPress={handleBookTicket}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <MaterialIcons name="confirmation-number" size={18} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Book Ticket</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animatable.View>
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