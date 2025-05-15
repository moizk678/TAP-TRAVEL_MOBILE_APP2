import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";
import RFIDOrderModal from "./RFIDOrderModal";

const Profile = () => {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded?.sub;

      const { data } = await apiClient.get(`/user/${userId}`);
      if (data && data.user) {
        const u = data.user;
        setUser(u);
        setName(u.name);
        setPhoneNumber(u.phoneNumber);
        setEmail(u.email);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to load profile" });
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!name || !phoneNumber) {
      Toast.show({ type: "info", text1: "Name and Phone Number are required" });
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);
      await apiClient.patch(`/user/update-profile`, {
        userId,
        name,
        phoneNumber,
      });
      Toast.show({ type: "success", text1: "Profile updated successfully" });
      setEditModalVisible(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Profile update failed" });
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      Toast.show({ type: "info", text1: "Both fields are required" });
      return;
    }
    try {
      await apiClient.post(`/user/change-password`, {
        email,
        oldPassword,
        newPassword,
      });
      Toast.show({ type: "success", text1: "Password changed successfully" });
      setPasswordModalVisible(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      Toast.show({ type: "error", text1: "Password change failed" });
    }
  };

  const handleModalSubmit = async (addressData) => {
    setSelectedAddress(addressData);
    if (
      !addressData?.province ||
      !addressData?.city ||
      !addressData?.postalCode ||
      !addressData?.address
    ) {
      Toast.show({ type: "info", text1: "Please fill all fields" });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);
      const payload = {
        userId,
        address: addressData,
        RFIDCardStatus: "booked",
      };
      await apiClient.patch("/user/update-profile", payload);
      Toast.show({ type: "success", text1: "RFID request sent" });
      setUser({ ...user, RFIDCardStatus: "booked" });
      setShowOrderForm(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to request RFID card" });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>Profile Settings</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>

          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{phoneNumber}</Text>

          <View style={{ marginVertical: 12 }} />
          <AppButton
            text="Edit Profile"
            onPress={() => setEditModalVisible(true)}
            variant="secondary"
          />

          <View style={styles.divider} />

          <AppButton
            text="Change Password"
            onPress={() => setPasswordModalVisible(true)}
            variant="secondary"
          />

          <View style={styles.divider} />

          {user?.RFIDCardStatus === "pending" ? (
            <AppButton
              text="Order RFID Card"
              variant="secondary"
              onPress={() => setShowOrderForm(true)}
            />
          ) : (
            <AppButton
              text={`RFID Status: ${user?.RFIDCardStatus}`}
              variant="green"
            />
          )}
        </View>
      </ScrollView>

      {/* Red Logout Button at bottom */}
      <View style={styles.logoutWrapper}>
       <AppButton
  text="Logout"
  onPress={logout}
  variant="danger"
/>

      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Profile</Text>
            <AppInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <AppInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <View style={{ marginTop: 12 }}>
              <AppButton
                text="Save"
                variant="primary"
                onPress={updateProfile}
              />
              <View style={{ marginVertical: 6 }} />
              <AppButton
                text="Cancel"
                variant="secondary"
                onPress={() => setEditModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Change Password</Text>
            <AppInput
              placeholder="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <AppInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={{ marginTop: 12 }}>
              <AppButton
                text="Update Password"
                variant="primary"
                onPress={changePassword}
              />
              <View style={{ marginVertical: 6 }} />
              <AppButton
                text="Cancel"
                variant="secondary"
                onPress={() => setPasswordModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <RFIDOrderModal
        visible={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        onSubmit={handleModalSubmit}
        initialAddress={selectedAddress}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  container: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    color: "#2C3E50",
    marginTop: 12,
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 20,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center",
  },
  logoutWrapper: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 10,
  },
});
