import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import apiClient from "../../api/apiClient";
import polyline from "@mapbox/polyline";
import * as Animatable from "react-native-animatable";

const GOOGLE_MAPS_API_KEY = "AIzaSyA6V89_30qIOKJEV948T6-a_aPLaBRfiLs";

const TrackLocationScreen = ({ route }) => {
  const { busId } = route.params;
  const [busData, setBusData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await getLocation();
        await fetchBusData();
      } catch (err) {
        console.error("Init error:", err);
        Alert.alert("Error", "Something went wrong while initializing.");
      }
    };
    initialize();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location access is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  };

  const fetchBusData = async () => {
    const res = await apiClient.post("/bus/bus-advance-search", { _id: busId });
    const data = res.data.data[0];
    setBusData(data);
    const stops = data.route?.stops || [];

    if (stops.length >= 2) {
      await fetchRouteFromGoogleAPI(stops);
    } else {
      Alert.alert("Insufficient Stops", "Route must have at least two stops.");
    }

    setLoading(false);
  };

  const fetchRouteFromGoogleAPI = async (stops) => {
    const origin = `${stops[0].geometry.location.lat},${stops[0].geometry.location.lng}`;
    const destination = `${stops[stops.length - 1].geometry.location.lat},${
      stops[stops.length - 1].geometry.location.lng
    }`;
    const waypoints = stops
      .slice(1, -1)
      .map(
        (stop) => `${stop.geometry.location.lat},${stop.geometry.location.lng}`
      )
      .join("|");

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes.length) {
        const points = polyline.decode(json.routes[0].overview_polyline.points);
        const routeCoordinates = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));

        setRouteCoords(routeCoordinates);
        const leg = json.routes[0].legs;
        const totalDistance = leg.reduce(
          (acc, curr) => acc + curr.distance.value,
          0
        );
        const totalDuration = leg.reduce(
          (acc, curr) => acc + curr.duration.value,
          0
        );
        setDistance((totalDistance / 1000).toFixed(2) + " km");
        setDuration(Math.ceil(totalDuration / 60) + " mins");
      } else {
        Alert.alert("Routing Error", "No route found.");
      }
    } catch (err) {
      console.error("Directions API Error:", err);
      Alert.alert("Error", "Failed to fetch route.");
    }
  };

  const handleStartNavigation = () => {
    if (!busData?.route?.stops?.length) return;

    const stops = busData.route.stops;
    const origin = `${stops[0].geometry.location.lat},${stops[0].geometry.location.lng}`;
    const destination = `${stops[stops.length - 1].geometry.location.lat},${
      stops[stops.length - 1].geometry.location.lng
    }`;
    const waypoints = stops
      .slice(1, -1)
      .map(
        (stop) => `${stop.geometry.location.lat},${stop.geometry.location.lng}`
      )
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;

    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Failed to open Google Maps.")
    );
  };

  if (loading || !userLocation) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#292966" />
        <Text style={{ marginTop: 12 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={userLocation}>
        <Marker coordinate={userLocation} title="You" pinColor="blue" />

        {busData?.route?.stops?.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: stop.geometry.location.lat,
              longitude: stop.geometry.location.lng,
            }}
            title={`Stop ${index + 1}`}
            pinColor={
              index === 0
                ? "green"
                : index === busData.route.stops.length - 1
                ? "red"
                : "orange"
            }
          />
        ))}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={4} />
        )}
      </MapView>

      <Animatable.View
        animation="fadeInUp"
        duration={500}
        style={styles.infoBox}
      >
        {distance && duration && (
          <View style={styles.infoTextBox}>
            <Text style={styles.infoText}>📏 {distance}</Text>
            <Text style={styles.infoText}>⏱️ {duration}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.navButton} onPress={handleStartNavigation}>
          <Text style={styles.navButtonText}>🧭 Start Navigation</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

export default TrackLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ffffffee",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  infoTextBox: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    marginBottom: 4,
  },
  navButton: {
    backgroundColor: "#292966",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
