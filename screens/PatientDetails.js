import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const PatientDetails = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({ bloodPressure: '', heartRate: '', temperature: '', oxygenLevel: '' });
  const [diseases, setDiseases] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatient(response.data.user);
    };
    fetchPatient();
  }, [patientId]);

  const handleUpdateMedicalHistory = async () => {
    const token = await AsyncStorage.getItem('token');
    await axios.post(`http://${IP_ADDRESS}:5000/api/user/patient/medical-history`, {
      patientId,
      vitals,
      diseases: diseases.split(',').map(d => d.trim()),
      notes,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setVitals({ bloodPressure: '', heartRate: '', temperature: '', oxygenLevel: '' });
    setDiseases('');
    setNotes('');
    navigation.goBack(); // Return to DoctorProfile
  };

  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text>Diseases: {item.diseases.join(', ')}</Text>
      <Text>Notes: {item.notes}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      {patient && (
        <View style={styles.profileSection}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.sectionTitle}>Add Medical History</Text>
          <TextInput style={styles.input} placeholder="Blood Pressure" value={vitals.bloodPressure} onChangeText={(text) => setVitals({ ...vitals, bloodPressure: text })} />
          <TextInput style={styles.input} placeholder="Heart Rate" value={vitals.heartRate} onChangeText={(text) => setVitals({ ...vitals, heartRate: text })} />
          <TextInput style={styles.input} placeholder="Temperature" value={vitals.temperature} onChangeText={(text) => setVitals({ ...vitals, temperature: text })} />
          <TextInput style={styles.input} placeholder="Oxygen Level" value={vitals.oxygenLevel} onChangeText={(text) => setVitals({ ...vitals, oxygenLevel: text })} />
          <TextInput style={styles.input} placeholder="Diseases (comma-separated)" value={diseases} onChangeText={setDiseases} />
          <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />
          <TouchableOpacity style={styles.button} onPress={handleUpdateMedicalHistory}>
            <Text style={styles.buttonText}>Update History</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Medical History</Text>
          <FlatList
            data={patient.medicalHistory}
            renderItem={renderHistory}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  profileSection: { alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '600', color: '#333', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
  input: { height: 50, width: '100%', backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, elevation: 2 },
  button: { backgroundColor: 'black', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  historyCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
});

export default PatientDetails;