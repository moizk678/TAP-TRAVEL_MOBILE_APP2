import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";

import AppSelect from "../../Components/AppSelect";
import AppInput from "../../Components/AppInput";
import { pakistanCities } from "../../utils/pakistanCities";
import AppButton from "../../Components/Button";
import * as Animatable from "react-native-animatable";

const RFIDOrderModal = ({ visible, onClose, onSubmit, initialAddress }) => {
  const [formData, setFormData] = useState({
    province: "",
    city: "",
    postalCode: "",
    address: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

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
  }, []);

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animatable.View animation="fadeInUp" duration={400} style={styles.modal}>
          <Text style={styles.title}>📍 Shipping Address</Text>

          <AppSelect
            items={provinces.map((province) => ({
              label: province,
              value: province,
            }))}
            placeholder="Select Province"
            onValueChange={handleProvinceChange}
            value={formData.province}
            variant="secondary"
          />

          <AppSelect
            items={cities.map((city) => ({
              label: city,
              value: city,
            }))}
            placeholder="Select City"
            onValueChange={(value) => handleChange("city", value)}
            value={formData.city}
            variant="secondary"
          />

          <AppInput
            placeholder="Postal Code"
            value={formData.postalCode}
            onChangeText={(value) => handleChange("postalCode", value)}
            keyboardType="numeric"
            variant="secondary"
          />

          <AppInput
            placeholder="Full Address"
            value={formData.address}
            onChangeText={(value) => handleChange("address", value)}
            variant="secondary"
          />

          <View style={styles.buttonRow}>
            <AppButton
              text="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.buttonSpacing}
            />
            <AppButton
              text="Submit"
              onPress={handleSubmit}
              variant="primary"
              style={styles.buttonSpacing}
            />
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

export default RFIDOrderModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  buttonSpacing: {
    flex: 1,
    marginHorizontal: 6,
  },
});
