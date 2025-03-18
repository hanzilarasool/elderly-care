import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  // Fetch alerts on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/patient/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };
    fetchAlerts();
  }, []);

  // Dismiss an alert
  const handleDismissAlert = async (patientId, alertId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://${IP_ADDRESS}:5000/api/user/patient/dismiss-alert`, {
        patientId,
        alertId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter(alert => alert._id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const renderAlert = ({ item }) => (
    <View style={styles.alertCard}>
      <Text style={styles.alertText}>Patient: {item.patientName}</Text>
      <Text style={styles.alertText}>Message: {item.message}</Text>
      <Text style={styles.alertText}>Date: {new Date(item.date).toLocaleString()}</Text>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => handleDismissAlert(item.patientId, item._id)}
      >
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={item => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No active alerts.</Text>}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 20 },
  alertCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  alertText: { fontSize: 14, color: '#666' },
  dismissButton: { backgroundColor: '#DC3545', padding: 10, borderRadius: 5, marginTop: 10, alignSelf: 'flex-end' },
  dismissButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default Alerts;