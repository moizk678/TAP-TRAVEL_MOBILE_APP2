import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AppSelect from "../../Components/AppSelect";
import AppDatePicker from "../../Components/AppDatePicker";
import AppButton from "../../Components/Button";
import BusCard from "./BusCard";
import { apiBaseUrl } from "../../config/urls";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "react-native-vector-icons";
import { useTheme } from "../../theme/theme";
import GlobalRefreshWrapper from "../../Components/GlobalRefreshWrapper";
import { AuthContext } from "../../context/AuthContext";
import LottieView from "lottie-react-native";
import BusLoadingAnimation from "../../../assets/animations/finding_buses.json";


const BookingForm = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { refreshUserData } = useContext(AuthContext);
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cities, setCities] = useState([]);
  const [formErrors, setFormErrors] = useState({
    fromCity: "",
    toCity: "",
    date: "",
  });
  const [formData, setFormData] = useState({
    fromCity: "",
    toCity: "",
    date: "",
  });

  // New state to track form completeness
  const [isFormComplete, setIsFormComplete] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  // Effect to check if all form fields are filled
  useEffect(() => {
    const { fromCity, toCity, date } = formData;
    const complete = fromCity && fromCity.trim() !== "" && 
                     toCity && toCity.trim() !== "" && 
                     date && date !== "" && 
                     fromCity && toCity && fromCity.trim() !== toCity.trim();
    setIsFormComplete(complete);
  }, [formData]);

  // Function to clear the form
  const clearForm = () => {
    setFormData({
      fromCity: "",
      toCity: "",
      date: "",
    });
    setFormErrors({
      fromCity: "",
      toCity: "",
      date: "",
    });
  };

  // Custom refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    console.log("Refreshing buses and user data...");
    setRefreshing(true);
    try {
      // Clear the form when refreshing
      clearForm();
      
      // Reset search state
      setHasSearched(false);
      
      // Refresh buses data
      await fetchBuses();
      
      // Also refresh user data if needed
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      Alert.alert("Refresh Failed", "Could not refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/bus/future`);
      const today = new Date().toISOString().split("T")[0];
      const filteredData = response.data.filter((bus) => {
        const busDate = new Date(bus.date).toISOString().split("T")[0];
        return busDate >= today;
      });
      setBuses(filteredData);
      extractCities(filteredData);
    } catch (error) {
      console.error("Error fetching buses:", error);
      Alert.alert(
        "Data Loading Error",
        "Could not load bus information. Pull down to refresh and try again."
      );
    }
    setLoading(false);
  };

  const extractCities = (busesData) => {
    const citySet = new Set();
    busesData.forEach((bus) => {
      citySet.add(bus.route.startCity);
      citySet.add(bus.route.endCity);
    });
    setCities([...citySet]);
  };

  const handleInputChange = (name, value) => {
    // Clear the specific error when the user updates that field
    setFormErrors({
      ...formErrors,
      [name]: "",
    });

    // If changing fromCity or toCity, check if they're the same
    if (name === "fromCity" && value && formData.toCity && value === formData.toCity) {
      setFormErrors({
        ...formErrors,
        fromCity: "Departure and arrival cities cannot be the same",
      });
    } else if (name === "toCity" && value && formData.fromCity && value === formData.fromCity) {
      setFormErrors({
        ...formErrors,
        toCity: "Departure and arrival cities cannot be the same",
      });
    }

    setFormData({ ...formData, [name]: value });
  };

  const onDateChange = (selectedDate) => {
    if (!selectedDate) return;
    
    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    // Clear the date error
    setFormErrors({
      ...formErrors,
      date: "",
    });
    
    // Check if selected date is in the past
    if (selectedDateObj < today) {
      setFormErrors({
        ...formErrors,
        date: "Cannot select a date in the past",
      });
    }
    
    setFormData({ ...formData, date: formattedDate });
  };

  const validateForm = () => {
    const { fromCity, toCity, date } = formData;
    const newErrors = {
      fromCity: "",
      toCity: "",
      date: "",
    };
    
    let isValid = true;
    
    // Check for empty fields
    if (!fromCity || !fromCity.trim()) {
      newErrors.fromCity = "Please select a departure city";
      isValid = false;
    }
    
    if (!toCity || !toCity.trim()) {
      newErrors.toCity = "Please select an arrival city";
      isValid = false;
    }
    
    if (!date) {
      newErrors.date = "Please select a date";
      isValid = false;
    }
    
    // Check if fromCity and toCity are the same
    if (fromCity && toCity && fromCity.trim() && toCity.trim() && fromCity.trim() === toCity.trim()) {
      newErrors.fromCity = "Departure and arrival cities cannot be the same";
      newErrors.toCity = "Departure and arrival cities cannot be the same";
      isValid = false;
    }
    
    // Check if date is in the past
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Cannot select a date in the past";
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const filterBuses = () => {
    const { fromCity, toCity, date } = formData;
    const selectedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : null;
    if (!selectedDate) return;

    const results = buses.filter((bus) => {
      const busStartCity = bus.route.startCity.trim().toLowerCase();
      const busEndCity = bus.route.endCity.trim().toLowerCase();
      const selectedFromCity = fromCity.trim().toLowerCase();
      const selectedToCity = toCity.trim().toLowerCase();
      const busDate = bus.date
        ? new Date(bus.date).toISOString().split("T")[0]
        : null;
      return (
        busStartCity === selectedFromCity &&
        busEndCity === selectedToCity &&
        busDate === selectedDate
      );
    });

    setFilteredBuses(results);
    setLoading(false);
  };

  const handleSubmit = () => {
    // Run validation first
    const isValid = validateForm();
    
    // Get all error messages after validation
    const errorMessages = Object.values(formErrors).filter(error => error);
    
    // If there are errors, show them in an alert
    if (!isValid) {
      Alert.alert(
        "Form Validation Error",
        errorMessages.join("\n"),
        [{ text: "OK" }]
      );
      return;
    }
    
    // If validation passes, proceed with search
    setLoading(true);
    setHasSearched(true);
    filterBuses();
  };

  const handleShowAllBuses = () => {
    setHasSearched(false);
    clearForm(); // Clear the form when showing all buses
  };

  const handleBookTicket = (busId) => {
    navigation.navigate("BookTicket", { busId });
  };

  const busesToShow = hasSearched ? filteredBuses : buses;

  const getErrorStyle = (fieldName) => {
    return formErrors[fieldName] ? styles.inputError : {};
  };

  const renderHeaderWithIcon = (title, icon) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.basic}50` }]}>
        <MaterialIcons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Your Journey</Text>
      </View>
      
      <GlobalRefreshWrapper
        onRefresh={handleRefresh}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View animation="fadeIn" duration={800}>
          <View style={[styles.bannerContainer, { backgroundColor: "#E8E8F0" }]}>
            <View style={styles.bannerTextContainer}>
              <Text style={[styles.bannerTitle, { color: "#1E293B" }]}>Book Your Trip</Text>
              <Text style={[styles.bannerSubtitle, { color: "#64748B" }]}>
                Find bus routes
              </Text>
            </View>
            <View style={[styles.busIconContainer, { backgroundColor: "rgba(41, 41, 102, 0.1)" }]}>
              <MaterialIcons name="directions-bus" size={32} color={theme.colors.primary} />
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.formCard}>
            {renderHeaderWithIcon("Trip Details", "map")}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>From</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="place" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <AppSelect
                  selectedValue={formData.fromCity}
                  items={cities.map((city) => ({ label: city, value: city }))}
                  onValueChange={(itemValue) =>
                    handleInputChange("fromCity", itemValue)
                  }
                  value={formData.fromCity}
                  placeholder="Select departure city"
                  style={[styles.select, getErrorStyle("fromCity")]}
                />
              </View>
              {formErrors.fromCity ? (
                <Text style={styles.errorText}>{formErrors.fromCity}</Text>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>To</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="pin-drop" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <AppSelect
                  selectedValue={formData.toCity}
                  items={cities.map((city) => ({ label: city, value: city }))}
                  onValueChange={(itemValue) =>
                    handleInputChange("toCity", itemValue)
                  }
                  value={formData.toCity}
                  placeholder="Select destination city"
                  style={[styles.select, getErrorStyle("toCity")]}
                />
              </View>
              {formErrors.toCity ? (
                <Text style={styles.errorText}>{formErrors.toCity}</Text>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Travel Date</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="event" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <AppDatePicker
                  value={formData.date}
                  onChange={onDateChange}
                  placeholder="Select your travel date"
                  variant="primary"
                  borderRadius={12}
                  style={[styles.datePicker, getErrorStyle("date")]}
                  minimumDate={new Date()}
                />
              </View>
              {formErrors.date ? (
                <Text style={styles.errorText}>{formErrors.date}</Text>
              ) : null}
            </View>
            
            <AppButton
              text="Find Buses"
              onPress={handleSubmit}
              variant="primary"
              style={styles.searchButtonContainer}
            />

            {!isFormComplete && (
              <Text style={styles.disabledButtonInfo}>
                Please fill all fields to search for buses
              </Text>
            )}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={300}>
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsHeaderLeft}>
                <MaterialIcons 
                  name={hasSearched ? "filter-list" : "view-list"} 
                  size={22} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.resultsTitle}>
                  {hasSearched ? "Search Results" : "Available Buses"}
                </Text>
              </View>
              
              {hasSearched && busesToShow.length > 0 && (
                <View style={[styles.resultsBadge, { backgroundColor: `${theme.colors.basic}50` }]}>
                  <Text style={[styles.resultsBadgeText, { color: theme.colors.primary }]}>{busesToShow.length}</Text>
                </View>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
    <LottieView
      source={BusLoadingAnimation}
      autoPlay
      loop
      style={{ width: 60, height: 60 }}
    />
    <Text style={styles.loadingText}>Finding buses...</Text>
  </View>
            ) : busesToShow.length > 0 ? (
              busesToShow.map((bus, index) => (
                <Animatable.View
                  key={bus._id || index}
                  animation="fadeInUp"
                  delay={index * 100}
                >
                  <BusCard bus={bus} index={index + 1} onBook={handleBookTicket} />
                </Animatable.View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="sentiment-dissatisfied" size={50} color="#CBD5E1" />
                <Text style={styles.noBusText}>No buses found for your search</Text>
                {hasSearched && (
                  <AppButton
                    text="View All Available Buses"
                    onPress={handleShowAllBuses}
                    variant="secondary"
                    style={{ marginTop: 12 }}
                  />
                )}
              </View>
            )}
          </View>
        </Animatable.View>
        
        {/* Pull to refresh hint */}
        <View style={styles.refreshHintContainer}>
          <MaterialIcons name="refresh" size={16} color="#94A3B8" />
          <Text style={styles.refreshHintText}>
            Pull down to refresh bus list and clear search
          </Text>
        </View>
      </GlobalRefreshWrapper>
    </SafeAreaView>
  );
};

export default BookingForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingBottom: 12,
  },
  bannerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    height: 70,
  },
  bannerTextContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
  },
  busIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    margin: 12,
    marginTop: 6,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
  formGroup: {
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 4,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputIcon: {
    paddingLeft: 12,
  },
  select: {
    flex: 1,
    paddingLeft: 8,
    paddingVertical: 0,
    fontSize: 16,
    color: "#334155",
    backgroundColor: "transparent",
  },
  datePicker: {
    flex: 1,
    paddingLeft: 8,
    paddingVertical: 0,
    fontSize: 16,
    color: "#334155",
    backgroundColor: "transparent",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    marginTop: 2,
    marginLeft: 4,
  },
  disabledButtonInfo: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#CBD5E1",
  },
  searchButtonContainer: {
    marginTop: 4,
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    margin: 12,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  resultsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },
  resultsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
  },
  resultsBadgeText: {
    fontWeight: "600",
    fontSize: 12,
  },
loadingContainer: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 40,
},
loadingText: {
  marginTop: 12,
  fontSize: 16,
  color: "#292966",
},
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 25,
  },
  noBusText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 12,
    marginBottom: 16,
  },
  refreshHintContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  refreshHintText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});