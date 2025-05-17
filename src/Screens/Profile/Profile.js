import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import Toast from "react-native-toast-message";
import AppInput from "../../Components/AppInput";
import AppButton from "../../Components/Button";
import RFIDOrderModal from "./RFIDOrderModal";
import { MaterialIcons } from "react-native-vector-icons";
import { useTheme } from "../../theme/theme";

const ProfileSection = ({ icon, label, value, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={styles.profileSection} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.basic }]}>
          <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <Text style={[styles.label, { color: "#334155" }]}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
};

const StatusBadge = ({ status }) => {
  let bgColor = "#E2E8F0";
  let textColor = "#64748B";
  
  if (status === "active") {
    bgColor = "#DCFCE7";
    textColor = "#166534";
  } else if (status === "pending") {
    bgColor = "#FEF9C3";
    textColor = "#854D0E";
  } else if (status === "booked") {
    bgColor = "#DBEAFE";
    textColor = "#1E40AF";
  }
  
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Text>
    </View>
  );
};

const Profile = () => {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editPhoneModalVisible, setEditPhoneModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Animation state for buttons
  const [logoutScale] = useState(new Animated.Value(1));

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

  const updateName = async () => {
    if (!name) {
      Toast.show({ type: "info", text1: "Name is required" });
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);
      await apiClient.patch(`/user/update-profile`, {
        userId,
        name,
      });
      Toast.show({ type: "success", text1: "Name updated successfully" });
      setEditNameModalVisible(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Name update failed" });
    }
  };

  const updatePhoneNumber = async () => {
    if (!phoneNumber) {
      Toast.show({ type: "info", text1: "Phone Number is required" });
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const { sub: userId } = jwtDecode(token);
      await apiClient.patch(`/user/update-profile`, {
        userId,
        phoneNumber,
      });
      Toast.show({ type: "success", text1: "Phone Number updated successfully" });
      setEditPhoneModalVisible(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Phone Number update failed" });
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

  // Button animation handlers
  const handlePressIn = () => {
    Animated.spring(logoutScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(logoutScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: "#f8fafc" }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Profile</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        <View style={styles.container}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Edit Personal Information</Text>

          <ProfileSection 
            icon="person-outline" 
            label="Full Name" 
            value={name} 
            onPress={() => setEditNameModalVisible(true)}
          />

          <ProfileSection 
            icon="phone-iphone" 
            label="Phone Number" 
            value={phoneNumber} 
            onPress={() => setEditPhoneModalVisible(true)}
          />

          <ProfileSection 
            icon="lock-outline" 
            label="Password" 
            value="••••••••" 
            onPress={() => setPasswordModalVisible(true)}
          />

          <Text style={[styles.sectionTitle, {marginTop: 24, color: theme.colors.secondary}]}>RFID Card</Text>

          {user?.RFIDCardStatus === "pending" ? (
            <TouchableOpacity 
              style={[styles.rfidButton, { backgroundColor: theme.colors.basic }]} 
              onPress={() => setShowOrderForm(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="credit-card" size={24} color={theme.colors.primary} />
              <Text style={[styles.rfidButtonText, { color: theme.colors.primary }]}>Order RFID Card</Text>
            </TouchableOpacity>
          ) : user?.RFIDCardStatus === "booked" ? (
            <View style={styles.rfidStatusContainer}>
              <MaterialIcons 
                name="hourglass-empty" 
                size={24} 
                color="#F59E0B" 
              />
              <Text style={styles.rfidStatusText}>
                Delivery under progress...
              </Text>
            </View>
          ) : user?.RFIDCardStatus === "delivered" ? (
            <View style={styles.rfidStatusContainer}>
              <MaterialIcons 
                name="check-circle" 
                size={24} 
                color={theme.colors.green} 
              />
              <Text style={styles.rfidStatusText}>
                Your RFID card is active.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutWrapper}>
        <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logout}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <MaterialIcons name="logout" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Edit Name Modal */}
      <Modal visible={editNameModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderText, { color: theme.colors.primary }]}>Edit Name</Text>
              <TouchableOpacity onPress={() => setEditNameModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>Full Name</Text>
              <AppInput
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.modalActions}>
              <AppButton
                text="Save Changes"
                variant="primary"
                onPress={updateName}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Phone Number Modal */}
      <Modal visible={editPhoneModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderText, { color: theme.colors.primary }]}>Edit Phone Number</Text>
              <TouchableOpacity onPress={() => setEditPhoneModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>Phone Number</Text>
              <AppInput
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.modalActions}>
              <AppButton
                text="Save Changes"
                variant="primary"
                onPress={updatePhoneNumber}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderText, { color: theme.colors.primary }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>Current Password</Text>
              <AppInput
                placeholder="Enter current password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>New Password</Text>
              <AppInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalActions}>
              <AppButton
                text="Update Password"
                variant="primary"
                onPress={changePassword}
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
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    color: "#64748B",
    marginRight: 8,
  },
  rfidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  rfidButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  rfidStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  rfidStatusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginLeft: 12,
  },
  logoutWrapper: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 30,
    height: 48,
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
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  modalActions: {
    marginTop: 12,
  },
});