import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';

import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;
const Reports = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  // Fetch doctor's patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctor = response.data.user;
        // Fetch full patient details for each patient ID
        const patientDetails = await Promise.all(
          doctor.patients.map(async (id) => {
            const patientResponse = await axios.get(`http://${IP_ADDRESS}:5000/api/user/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return patientResponse.data.user;
          })
        );
        setPatients(patientDetails);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch patient reports when selected
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedPatientId) return;
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/${selectedPatientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedPatient(response.data.user);
        setReports(response.data.user.medicalHistory.filter(item => item.filePath));
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, [selectedPatientId]);

  // Pick a document for upload
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      setFile(result);
    }
  };

  // Upload report
  const handleUploadReport = async () => {
    if (!file || !selectedPatientId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('patientId', selectedPatientId);
      formData.append('notes', notes);
      formData.append('report', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      await axios.post(`http://${IP_ADDRESS}:5000/api/user/patient/upload-report`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh reports
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/${selectedPatientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data.user.medicalHistory.filter(item => item.filePath));
      setFile(null);
      setNotes('');
    } catch (error) {
      console.error('Error uploading report:', error);
    }
  };

  const renderReport = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.reportText}>File: {item.fileName}</Text>
      <Text style={styles.reportText}>Notes: {item.notes || 'None'}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      <Text style={styles.title}>Reports</Text>

      <Text style={styles.sectionTitle}>Select Patient</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPatientId}
          onValueChange={(itemValue) => setSelectedPatientId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a patient" value="" />
          {patients.map(patient => (
            <Picker.Item key={patient._id} label={patient.name} value={patient._id} />
          ))}
        </Picker>
      </View>

      {selectedPatient && (
        <>
          <Text style={styles.sectionTitle}>Reports for {selectedPatient.name}</Text>
          <FlatList
            data={reports}
            renderItem={renderReport}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No reports available.</Text>}
          />

          <Text style={styles.sectionTitle}>Upload New Report</Text>
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={pickDocument}>
            <Text style={styles.buttonText}>{file ? file.name : 'Select Report'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleUploadReport}>
            <Text style={styles.buttonText}>Upload Report</Text>
          </TouchableOpacity>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
  pickerContainer: { backgroundColor: 'white', borderRadius: 8, elevation: 2, marginBottom: 20 },
  picker: { height: 50, width: '100%' },
  reportCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  reportText: { fontSize: 14, color: '#666' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  input: { height: 50, width: '100%', backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, elevation: 2 },
  button: { backgroundColor: 'black', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
});

export default Reports;