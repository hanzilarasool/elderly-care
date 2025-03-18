import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const AdminDashboard = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  // Fetch all doctors and patients on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = response.data.users || [];
        setDoctors(users.filter(user => user.role === 'doctor'));
        setPatients(users.filter(user => user.role === 'patient'));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Assign patient to doctor
  const handleAssignPatient = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://${IP_ADDRESS}:5000/api/user/assign-patient`, {
        doctorId: selectedDoctor,
        patientId: selectedPatient,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalVisible(false);
      // Refresh the list
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data.users || [];
      setDoctors(users.filter(user => user.role === 'doctor'));
      setPatients(users.filter(user => user.role === 'patient'));
    } catch (error) {
      console.error('Error assigning patient:', error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://${IP_ADDRESS}:5000/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the list
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data.users || [];
      setDoctors(users.filter(user => user.role === 'doctor'));
      setPatients(users.filter(user => user.role === 'patient'));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const renderDoctor = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.name} (Doctor)</Text>
      <Text style={styles.userDetail}>Specialization: {item.specialization || 'N/A'}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item._id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPatient = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.name} (Patient)</Text>
      <Text style={styles.userDetail}>Assigned Doctor: {item.doctor ? item.doctor.name : 'None'}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item._id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      <View style={styles.dashboardSection}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Assign Patient to Doctor</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Doctors</Text>
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No doctors available.</Text>}
        />

        <Text style={styles.sectionTitle}>Patients</Text>
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No patients available.</Text>}
        />
      </View>

      {/* Modal for assigning patient to doctor */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Patient to Doctor</Text>

            <Text>Select Doctor:</Text>
            <Picker
              selectedValue={selectedDoctor}
              onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a doctor" value="" />
              {doctors.map(doctor => (
                <Picker.Item key={doctor._id} label={doctor.name} value={doctor._id} />
              ))}
            </Picker>

            <Text>Select Patient:</Text>
            <Picker
              selectedValue={selectedPatient}
              onValueChange={(itemValue) => setSelectedPatient(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a patient" value="" />
              {patients.map(patient => (
                <Picker.Item key={patient._id} label={patient.name} value={patient._id} />
              ))}
            </Picker>

            <TouchableOpacity style={styles.button} onPress={handleAssignPatient}>
              <Text style={styles.buttonText}>Assign</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dashboardSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AdminDashboard;