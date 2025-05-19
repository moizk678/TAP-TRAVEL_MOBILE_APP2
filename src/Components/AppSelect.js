import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  Text, 
  Platform, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Pressable,
  Dimensions,
  Animated
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useTheme } from "../theme/theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AppSelect = ({
  items = [],
  onValueChange,
  placeholder = "Select an option",
  value,
  variant = "primary",
  label,
  error,
  style,
  borderRadius = 12,
  showDropdownIcon = true,
  ...props
}) => {
  const { theme } = useTheme();
  const borderColor = theme.colors[variant] || theme.colors.primary;
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  // Find the selected item's label
  const selectedLabel = value 
    ? items.find(item => item.value === value)?.label || value 
    : "";

  const toggleModal = () => {
    if (modalVisible) {
      // Close animation
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => setModalVisible(false));
    } else {
      // Open animation
      setModalVisible(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT / 4, 0]
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        { borderBottomColor: theme.colors.neutral100 },
        item.value === value && { backgroundColor: `${theme.colors.primary}15` }
      ]}
      onPress={() => {
        onValueChange(item.value);
        toggleModal();
      }}
    >
      <Text style={[
        styles.modalItemText, 
        item.value === value && { color: theme.colors.primary, fontWeight: "600" }
      ]}>
        {item.label}
      </Text>
      {item.value === value && (
        <MaterialIcons name="check" size={18} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Custom Select Field - Touch Area */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleModal}
        style={[
          styles.container,
          {
            borderColor: error ? theme.colors.error : borderColor,
            borderRadius,
            backgroundColor: "#F8FAFC",
          },
        ]}
      >
        <Text 
          style={[
            styles.selectedText,
            !value && { color: "#94A3B8" } // Placeholder color
          ]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        {showDropdownIcon && (
          <MaterialIcons 
            name="keyboard-arrow-down"
            size={22} 
            color="#64748B"
          />
        )}
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={toggleModal}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [{ translateY }],
                opacity
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>{placeholder}</Text>
              <TouchableOpacity onPress={toggleModal}>
                <MaterialIcons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>
            
            
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </Animated.View>
        </Pressable>
      </Modal>

      {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}
      
      {/* Hidden RNPickerSelect for platforms or cases where the custom modal isn't ideal */}
      <View style={{ display: 'none' }}>
        <RNPickerSelect
          onValueChange={onValueChange}
          value={value}
          items={items}
          placeholder={{ label: placeholder, value: null }}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  selectedText: {
    flex: 1,
    fontSize: 15,
    color: "#334155",
    marginLeft: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchHint: {
    fontSize: 14,
    color: '#64748B',
  },
  modalList: {
    paddingTop: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemText: {
    fontSize: 15,
    color: '#334155',
  },
});

// Keep the original styles for RNPickerSelect (as fallback)
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    color: "#334155",
    paddingVertical: 6,
  },
  inputAndroid: {
    fontSize: 16,
    color: "#334155",
    paddingVertical: 6,
  },
  placeholder: {
    color: "#94A3B8",
  },
  iconContainer: {
    top: Platform.OS === "ios" ? 15 : 10,
    right: 12,
  },
});

export default AppSelect;