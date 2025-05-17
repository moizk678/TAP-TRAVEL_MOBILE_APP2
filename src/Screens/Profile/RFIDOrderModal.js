import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

import AppSelect from "../../Components/AppSelect";
import AppInput from "../../Components/AppInput";
import { pakistanCities } from "../../utils/pakistanCities";
import AppButton from "../../Components/Button";

const RFIDOrderModal = ({ visible, onClose, onSubmit, initialAddress }) => {
  const [formData, setFormData] = useState({
    province: "",
    city: "",
    postalCode: "",
    address: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState("");

  useEffect(() => {
    const uniqueProvinces = [
      ...new Set(Object.values(pakistanCities).map((city) => city.province)),
    ];
    setProvinces(uniqueProvinces);

    if (initialAddress) {
      setFormData(initialAddress);
      const citiesInProvince = Object.values(pakistanCities)
        .filter((city) => city.province === initialAddress.province)
        .map((city) => city.name);
      setCities(citiesInProvince);
    }
  }, [initialAddress]);

  const handleProvinceChange = (selectedProvince) => {
    const filteredCities = Object.values(pakistanCities)
      .filter((city) => city.province === selectedProvince)
      .map((city) => city.name);

    setFormData((prev) => ({
      ...prev,
      province: selectedProvince,
      city: "",
    }));
    setCities(filteredCities);
  };

  const handleChange = (field, value) => {
    if (field === "postalCode") {
      // Only allow digits and limit to 5 characters
      const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 5);
      
      // Set error message if not exactly 5 digits
      if (sanitizedValue.length !== 0 && sanitizedValue.length !== 5) {
        setPostalCodeError("Postal code must be exactly 5 digits");
      } else {
        setPostalCodeError("");
      }
      
      setFormData((prev) => ({
        ...prev,
        [field]: sanitizedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.province) {
      Alert.alert("Form Incomplete", "Please select a province.");
      return false;
    }
    if (!formData.city) {
      Alert.alert("Form Incomplete", "Please select a city.");
      return false;
    }
    if (!formData.postalCode || formData.postalCode.length !== 5) {
      Alert.alert("Form Incomplete", "Please enter a valid 5-digit postal code.");
      return false;
    }
    if (!formData.address || formData.address.trim() === "") {
      Alert.alert("Form Incomplete", "Please enter your complete address.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSubmit(formData);
      }, 3000);
    }
  };

  const isFormValid = formData.province && 
                    formData.city && 
                    formData.postalCode && 
                    formData.postalCode.length === 5 &&
                    formData.address;

  return (
    <Modal visible={visible} animationType="slide">
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Animatable.View animation="fadeIn" duration={800} style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Final Step</Text>
                <Text style={styles.subtitle}>Let's get your RFID card delivered to you</Text>
                <Animatable.Image 
                  animation="pulse" 
                  iterationCount="infinite" 
                  duration={2000}
                  source={require('../../../assets/rfid-icon.png')} 
                  style={styles.rfidIcon}
                  resizeMode="contain"
                />
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={300} duration={800} style={styles.formContainer}>
                <Text style={styles.formTitle}>📍 Shipping Address</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Province</Text>
                  <AppSelect
                    items={provinces.map((province) => ({
                      label: province,
                      value: province,
                    }))}
                    placeholder="Select Province"
                    onValueChange={handleProvinceChange}
                    value={formData.province}
                    variant="secondary"
                    containerStyle={styles.selectContainer}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>City</Text>
                  <AppSelect
                    items={cities.map((city) => ({
                      label: city,
                      value: city,
                    }))}
                    placeholder="Select City"
                    onValueChange={(value) => handleChange("city", value)}
                    value={formData.city}
                    variant="secondary"
                    containerStyle={styles.selectContainer}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Postal Code</Text>
                  <AppInput
                    placeholder="Enter 5-digit Postal Code"
                    value={formData.postalCode}
                    onChangeText={(value) => handleChange("postalCode", value)}
                    keyboardType="numeric"
                    variant="secondary"
                    style={[styles.input, postalCodeError ? styles.inputError : null]}
                    maxLength={5}
                  />
                  {postalCodeError ? (
                    <Text style={styles.errorText}>{postalCodeError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Address</Text>
                  <AppInput
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChangeText={(value) => handleChange("address", value)}
                    variant="secondary"
                    multiline
                    style={[styles.input, styles.addressInput]}
                  />
                </View>

                <Animatable.View animation="fadeInUp" delay={600} duration={600}>
                  <AppButton
                    text="Complete Onboarding"
                    onPress={handleSubmit}
                    variant="primary"
                    style={styles.submitButton}
                  />
                </Animatable.View>
              </Animatable.View>

              {showSuccess && (
                <Animatable.View animation="zoomIn" duration={500} style={styles.successNotice}>
                  <View style={styles.successContent}>
                    <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.successIcon}>🎉</Animatable.Text>
                    <Text style={styles.successTitle}>Congratulations!</Text>
                    <Text style={styles.successText}>
                      Your RFID card has been booked successfully. It will be delivered to your address within 2-3 working days.
                    </Text>
                  </View>
                </Animatable.View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

export default RFIDOrderModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  rfidIcon: {
    width: 120,
    height: 120,
    marginTop: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f8fa",
    borderRadius: 8,
  },
  inputError: {
    borderColor: "#e74c3c",
    borderWidth: 1,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
  },
  addressInput: {
    height: 80,
    textAlignVertical: "top",
  },
  selectContainer: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
  },
  successNotice: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 10,
  },
  successContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 22,
  },
});