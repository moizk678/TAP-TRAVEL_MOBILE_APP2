import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { apiBaseUrl } from "../../config/urls";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../Components/Button";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";
import { Ionicons } from '@expo/vector-icons';


const BookTicket = ({ route }) => {
  const { busId } = route.params;
  const navigation = useNavigation();
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);



useEffect(() => {
  const fetchBusAndTickets = async () => {
    try {
      // Fetch bus data
      const busResponse = await fetch(`${apiBaseUrl}/bus/${busId}`);
      const busData = await busResponse.json();

      // Get userId from token
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const decoded = jwtDecode(token);
      const userId = decoded?.sub;
      if (!userId) throw new Error("No userId in token");

      // Fetch tickets for user
      const ticketsResponse = await fetch(`${apiBaseUrl}/ticket/user/information/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const ticketsJson = await ticketsResponse.json();

      // ticketsJson has shape: { active: [...], past: [...] }
      // Combine active and past tickets into one array
      const allTickets = [...(ticketsJson.active || []), ...(ticketsJson.past || [])];

      // Filter only tickets for this bus and with ticketStatus "booked"
      const bookedTickets = allTickets.filter(
        (ticket) => ticket.busId === busId && ticket.ticketStatus === "booked"
      );

      // Set of seatNumbers booked
      const bookedSeatNumbers = new Set(bookedTickets.map(t => t.seatNumber));

      // Update seats booked property
      const updatedSeats = busData.seats.map(seat => ({
        ...seat,
        booked: bookedSeatNumbers.has(seat.seatNumber),
      }));

      setSelectedBus({ ...busData, seats: updatedSeats });
    } catch (error) {
      console.error("Error fetching bus or tickets data:", error);
    }
  };

  if (busId) {
    fetchBusAndTickets();
  }
}, [busId]);


  const toggleSeatSelection = (seat) => {
    if (seat.booked) return;

    const alreadySelected = selectedSeats.find(
      (s) => s.seatNumber === seat.seatNumber
    );

    if (alreadySelected) {
      setSelectedSeats((prevSeats) =>
        prevSeats.filter((s) => s.seatNumber !== seat.seatNumber)
      );
    } else {
      setSelectedSeats((prevSeats) => [
        ...prevSeats,
        { ...seat, gender: null },
      ]);
    }
  };

  const [currentSeatForGender, setCurrentSeatForGender] = useState(null);

  const handleGenderAssignment = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded?.sub;
    const userName = decoded?.name;
    const email = decoded?.email;

    // Check if all seats have gender assigned
    const allSeatsHaveGender = selectedSeats.every(seat => seat.gender);
    
    if (!allSeatsHaveGender) {
      Toast.show({
        type: "error",
        text1: "Please assign gender for all selected seats",
      });
      return;
    }

    const totalAmount = selectedSeats.length * selectedBus.fare.actualPrice;

    navigation.navigate("PaymentScreen", {
      busId,
      userId,
      userName,
      email,
      amount: totalAmount,
      adminId: selectedBus?.busDetails?.adminId,
      selectedSeats: selectedSeats,
    });
  };
  
  const handleGenderSelection = (gender) => {
    if (!currentSeatForGender) return;
    
    // Check gender rules
    const neighborGender = currentSeatForGender?.neighborGender;
    if (neighborGender && neighborGender !== gender) {
      Toast.show({
        type: "error",
        text1: `Seat ${currentSeatForGender.seatNumber.split("-")[1]}: Must select ${
          neighborGender === "M" ? "Male" : "Female"
        }`,
      });
      return;
    }
    
    // Update the gender for the current seat only
    setSelectedSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.seatNumber === currentSeatForGender.seatNumber 
          ? { ...seat, gender: gender } 
          : seat
      )
    );
    
    setGenderModalVisible(false);
    setCurrentSeatForGender(null);
  };

  // Modified function to organize seats into the proper layout
  const organizeBusLayout = () => {
    if (!selectedBus || !selectedBus.seats) return [];

    const layout = {
      frontRow: [], // For seats 1-2
      middleRows: [], // For seats 3-38
      backRow: [], // For seats 39-43 (all 5 in one row)
    };

    // Sort seats by seat number
    const sortedSeats = [...selectedBus.seats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.split("-")[1]);
      const numB = parseInt(b.seatNumber.split("-")[1]);
      return numA - numB;
    });

    sortedSeats.forEach(seat => {
      const seatNum = parseInt(seat.seatNumber.split("-")[1]);
      
      if (seatNum <= 2) {
        layout.frontRow.push(seat);
      } else if (seatNum >= 39) {
        // All seats from 39-43 go to the back row
        layout.backRow.push(seat);
      } else {
        layout.middleRows.push(seat);
      }
    });

    return layout;
  };

  const renderSeat = (item) => {
    const isBooked = item.booked;
    const selectedSeat = selectedSeats.find(
      (s) => s.seatNumber === item.seatNumber
    );
    const isSelected = !!selectedSeat;

    let seatColor = "#BDC3C7"; // default: gray
    if (isBooked) {
      seatColor = item.gender === "M" ? "#4a90e2" : "#e94b86";
    } else if (isSelected) {
      seatColor = "#27ae60";
    }

    return (
      <TouchableOpacity
        key={item.seatNumber}
        style={[styles.seat, { backgroundColor: seatColor }]}
        onPress={() => toggleSeatSelection(item)}
        disabled={isBooked}
      >
        <Text style={styles.seatText}>{item.seatNumber.split("-")[1]}</Text>
        {isBooked && <Text style={styles.gender}>{item?.gender}</Text>}
      </TouchableOpacity>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!selectedBus) {
    return (
      <View style={styles.container}>
        <Text>Loading bus details...</Text>
      </View>
    );
  }

  const busLayout = organizeBusLayout();

  return (
    <Animatable.View animation="fadeInUp" duration={700} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selectedBus?.route?.startCity} → {selectedBus?.route?.endCity}
        </Text>
      </View>

      <Text style={styles.subtitle}>Select Your Seat</Text>

      {/* Seat Indication Guide */}
      <View style={styles.seatIndicationContainer}>
        <View style={styles.indicationItem}>
          <View style={[styles.indicationColor, { backgroundColor: "#BDC3C7" }]} />
          <Text style={styles.indicationText}>Available</Text>
        </View>
        <View style={styles.indicationItem}>
          <View style={[styles.indicationColor, { backgroundColor: "#4a90e2" }]} />
          <Text style={styles.indicationText}>Male</Text>
        </View>
        <View style={styles.indicationItem}>
          <View style={[styles.indicationColor, { backgroundColor: "#e94b86" }]} />
          <Text style={styles.indicationText}>Female</Text>
        </View>
        <View style={styles.indicationItem}>
          <View style={[styles.indicationColor, { backgroundColor: "#27ae60" }]} />
          <Text style={styles.indicationText}>Selected</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.busContainer}>
        {/* Driver Section */}
        <View style={styles.driverSection}>
          <View style={styles.driverPlaceholder} />
          <View style={styles.driverIconContainer}>
            <Text style={styles.driverEmoji}>👨‍✈️</Text>
          </View>
        </View>

        {/* Front Row (Seats 1-2) */}
        <View style={styles.frontRow}>
          {busLayout.frontRow.map(seat => renderSeat(seat))}
        </View>

        {/* Middle Rows (Seats 3-38) */}
        <View style={styles.middleRowsContainer}>
          {/* Create rows of 4 seats */}
          {Array.from({ length: Math.ceil(busLayout.middleRows.length / 4) }).map((_, rowIndex) => {
            const startIdx = rowIndex * 4;
            const rowSeats = busLayout.middleRows.slice(startIdx, startIdx + 4);
            
            // Organize seats in each row with 2 on each side
            const leftSeats = rowSeats.slice(0, 2);
            const rightSeats = rowSeats.slice(2, 4);
            
            return (
              <View key={`row-${rowIndex}`} style={styles.seatRow}>
                <View style={styles.seatSide}>
                  {leftSeats.map(seat => renderSeat(seat))}
                </View>
                <View style={styles.aisle} />
                <View style={styles.seatSide}>
                  {rightSeats.map(seat => renderSeat(seat))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Back Row (Seats 39-43) - Modified to show all 5 seats in one row */}
        {busLayout.backRow.length > 0 && (
          <View style={styles.backRow}>
            {busLayout.backRow.map(seat => renderSeat(seat))}
          </View>
        )}
      </ScrollView>

    {selectedSeats.length > 0 && (
  <View style={styles.selectionInfo}>
    {/* Attention-grabbing header */}
    <View style={styles.selectionHeader}>
      <Ionicons name="information-circle" size={22} color="#3182CE" />
      <Text style={styles.selectionText}>Selected Seats</Text>
    </View>
    
    {/* Gender selection guidance message */}
    <View style={styles.genderSelectionHint}>
      <Text style={styles.genderHintText}>
        Tap on seat selections below to asign genders
      </Text>
    </View>
    
    <View style={styles.selectedSeatsContainer}>
      {selectedSeats.map((seat) => {
        const needsGender = !seat.gender;
        
        return (
          <TouchableOpacity
            key={seat.seatNumber}
            style={[
              styles.selectedSeatChip,
              needsGender && styles.selectedSeatNoGender,
              {
                backgroundColor: seat.gender
                  ? seat.gender === "M"
                    ? "#4a90e2"
                    : "#e94b86"
                  : "#f8f9fa", // Light background for seats without gender
              },
            ]}
            onPress={() => {
              setCurrentSeatForGender(seat);
              setGenderModalVisible(true);
            }}
          >
            {needsGender && (
              <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                style={styles.genderIndicator}
              >
                <Ionicons name="alert-circle" size={14} color="#E53E3E" />
              </Animatable.View>
            )}
            <Text 
              style={[
                styles.selectedSeatChipText,
                needsGender && styles.selectedSeatChipTextNoGender
              ]}
            >
              {seat.seatNumber.split("-")[1]}
              {seat.gender ? ` (${seat.gender})` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    
    {/* Check if any seat needs gender assignment */}
    {selectedSeats.some(seat => !seat.gender) ? (
      <View style={styles.warningContainer}>
        <Ionicons name="warning" size={18} color="#DD6B20" />
        <Text style={styles.warningText}>
          Please assign gender to all seats to continue
        </Text>
      </View>
    ) : (
      <AppButton
        variant="secondary"
        text="Confirm Your Bookings"
        onPress={handleGenderAssignment}
      />
    )}
  </View>
)}

{/* Gender Selection Modal */}
<Modal
  animationType="fade"
  transparent={true}
  visible={genderModalVisible}
  onRequestClose={() => {
    setGenderModalVisible(false);
    setCurrentSeatForGender(null);
  }}
>
  <View style={styles.modalBackground}>
    <Animatable.View 
      animation="zoomIn" 
      duration={300} 
      style={styles.modalContainer}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          {currentSeatForGender ? 
            `Select Gender for Seat ${currentSeatForGender.seatNumber.split("-")[1]}` : 
            "Select Gender"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setGenderModalVisible(false);
            setCurrentSeatForGender(null);
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#6C757D" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.genderOption, styles.maleOption]}
          onPress={() => handleGenderSelection("M")}
          activeOpacity={0.7}
        >
          <View style={styles.genderIconContainer}>
            <Ionicons name="male" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.genderOptionText}>Male</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.genderOption, styles.femaleOption]}
          onPress={() => handleGenderSelection("F")}
          activeOpacity={0.7}
        >
          <View style={styles.genderIconContainer}>
            <Ionicons name="female" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.genderOptionText}>Female</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <TouchableOpacity
        onPress={() => {
          setGenderModalVisible(false);
          setCurrentSeatForGender(null);
        }}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </Animatable.View>
  </View>
</Modal>
    </Animatable.View>
  );
};

export default BookTicket;

const styles = StyleSheet.create({

    busContainer: {
    flexGrow: 1, // Ensures the ScrollView content expands
    paddingHorizontal: 50, // Adds horizontal padding to avoid overflow
  },

  selectionInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

    selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  genderSelectionHint: {
    backgroundColor: '#EBF8FF', // Light blue background
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  
  genderHintText: {
    fontSize: 14,
    color: '#2C5282',
    fontWeight: '500',
  },

  selectedSeatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  selectedSeatChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
  },

  selectedSeatNoGender: {
    borderWidth: 2,
    borderColor: '#E53E3E', // Red outline for seats without gender
    borderStyle: 'dashed', // Dashed border for emphasis
  },

selectedSeatChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

   selectedSeatChipTextNoGender: {
    color: '#4A5568', // Dark text for light background
  },
  
  genderIndicator: {
    marginRight: 4,
  },
  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEEBC8', // Light orange background
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  warningText: {
    color: '#DD6B20', // Orange text
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    flex: 1,
  },
  viewDetailsButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  viewDetailsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  // Seat indication styles
  seatIndicationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  indicationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicationColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  indicationText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  // Bus layout styles
  busContainer: {
    width: "100%",
    paddingBottom: 20,
    alignItems: "center",
  },
  driverSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 20,
  },
  driverPlaceholder: {
    flex: 1,
  },
  driverIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  driverEmoji: {
    fontSize: 24,
  },
  frontRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 20,
  },
  middleRowsContainer: {
    width: "100%",
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  seatSide: {
    flexDirection: "row",
  },
  aisle: {
    width: 30,
  },
  backRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  seat: {
    width: 57,
    height: 60,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#BDC3C7",
    elevation: 2,
  },
  seatText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  gender: {
    color: "#fff",
    fontSize: 12,
  },

  genderOption: {
    width: '100%',
    height: 70, // Reduced height
    flexDirection: 'row', // Changed to row layout
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // Reduced from 16
    marginBottom: 10, // Added margin between options
  },
  
  genderIconContainer: {
    marginRight: 8, // Add space between icon and text
  },
  
  maleOption: {
    backgroundColor: '#4361EE',
  },
  
  femaleOption: {
    backgroundColor: '#F72585',
  },
  
  genderOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

   divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    width: '100%',
    marginTop: 10,
  },

  selectionInfo: {
    marginTop: 10,
    alignItems: "center",
    paddingBottom: 20,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3182CE', // Blue for emphasis
    marginLeft: 6,
  },

modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    width: '70%', // Reduced from 80%
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16, // Reduced from 20
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

   closeButton: {
    padding: 2,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Reduced from 16
  },

  detailsModalContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 60,
    padding: 24,
    borderRadius: 14,
    elevation: 5,
    flex: 1,
  },
  modalTitle: {
    fontSize: 15, // Reduced from 20
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
cancelButton: {
    paddingVertical: 10, // Reduced from 12
    alignItems: 'center',
    width: '100%',
  },
  
  cancelButtonText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  // Details modal styles
  detailsScrollView: {
    flex: 1,
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 24,
    backgroundColor: "#f5f6fa",
    padding: 16,
    borderRadius: 10,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailsLabel: {
    flex: 1,
    fontSize: 14,
    color: "#7F8C8D",
  },
  detailsValue: {
    flex: 2,
    fontSize: 14,
    color: "#34495E",
    fontWeight: "500",
  },
});