import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location"; // Added for reverse geocoding

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertLocations, setAlertLocations] = useState({}); // Store addresses for each alert

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/falls/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched alerts:", response.data);
      const fetchedAlerts = response.data.falls;
      setAlerts(fetchedAlerts);

      // Reverse geocode each alert's location
      const locations = {};
      for (const alert of fetchedAlerts) {
        const coords = alert.message.match(/at ([\d.-]+, [\d.-]+)/)?.[1]; // Extract coords from message
        if (coords) {
          const [lat, lon] = coords.split(", ").map(Number);
          const address = await reverseGeocode(lat, lon);
          locations[alert._id] = address;
        }
      }
      setAlertLocations(locations);
    } catch (error) {
      console.error("Error fetching alerts:", error.response?.data || error.message);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const { street, city, region, country } = result[0];
        return `${street || ''} ${city || ''}, ${region || ''}, ${country || ''}`.trim() || 'Unknown Address';
      }
      return 'Unknown Address';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown Address';
    }
  };

  const clearAlert = async (alertId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`http://${IP_ADDRESS}:5000/api/falls/doctor/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter((alert) => alert._id !== alertId));
      setAlertLocations((prev) => {
        const newLocations = { ...prev };
        delete newLocations[alertId];
        return newLocations;
      });
    } catch (error) {
      console.error("Error clearing alert:", error.response?.data || error.message);
    }
  };

  const clearAllAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`http://${IP_ADDRESS}:5000/api/falls/doctor/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts([]);
      setAlertLocations({});
    } catch (error) {
      console.error("Error clearing all alerts:", error.response?.data || error.message);
    }
  };

  const renderAlert = ({ item }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertContent}>
        <Text style={styles.alertPatient}>
          Patient: {item.relatedPatient?.name || "Unknown"}
        </Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <Text style={styles.alertLocation}>
          Location: {alertLocations[item._id] || "Loading..."}
        </Text>
        <Text style={styles.alertTime}>
          Time: {new Date(item.date).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => clearAlert(item._id)}
      >
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#c3d6d8', '#B2EBF2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fall Alerts</Text>
        {alerts.length > 0 && (
          <TouchableOpacity style={styles.clearAllButton} onPress={clearAllAlerts}>
            <Ionicons name="trash-outline" size={24} color="#FFF" />
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No fall alerts yet.</Text>}
        contentContainerStyle={styles.flatListContent}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 82, 82, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
  },
  clearAllText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  alertItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertPatient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  alertMessage: {
    fontSize: 15,
    color: "#555",
    marginBottom: 5,
  },
  alertLocation: {
    fontSize: 14,
    color: "#00796B", // Teal for location to stand out
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 14,
    color: "#888",
  },
  clearButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  clearButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
  },
  flatListContent: {
    paddingBottom: 20,
  },
});

export default Alerts;