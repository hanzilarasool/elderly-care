// frontend/screens/PatientManagement.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const PatientManagement = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = response.data.users || [];
        setPatients(users.filter(user => user.role === 'patient'));
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleUnassignPatient = async (patientId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`http://${IP_ADDRESS}:5000/api/user/unassign-patient`, { patientId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data.users || [];
      setPatients(users.filter(user => user.role === 'patient'));
    } catch (error) {
      console.error('Error unassigning patient:', error);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://${IP_ADDRESS}:5000/api/user/user/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data.users || [];
      setPatients(users.filter(user => user.role === 'patient'));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPatient = ({ item, index }) => (
    <View style={styles.patientCard}>
      <Text style={styles.serialNumber}>{index + 1}</Text>
      <Text style={styles.patientText} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
      <Text style={styles.patientText} numberOfLines={1} ellipsizeMode="tail">
        {item.doctor ? item.doctor.name : 'None'}
      </Text>
      <View style={styles.actions}>
        {item.doctor && (
          <TouchableOpacity
            style={StyleSheet.compose(styles.actionButton, { backgroundColor: '#00796B' })}
            onPress={() => handleUnassignPatient(item._id)}
          >
            <Text style={styles.actionText}>Unassign</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePatient(item._id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Management</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('../assets/icons/search.png')} style={styles.searchIcon} />
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerSerial}>Sr. No</Text>
        <Text style={styles.headerText}>Patient Name</Text>
        <Text style={styles.headerText}>Doctor</Text>
        <Text style={styles.headerText}>Actions</Text>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No patients found.</Text>}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00796B',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  headerSerial: {
    flex: 0.5, // Smaller width for Sr. No
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  headerText: {
    flex: 2, // Larger width for Patient Name, Doctor, and Actions
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  serialNumber: {
    flex: 0.5, // Smaller width for Sr. No
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  patientText: {
    flex: 2, // Larger width for Patient Name and Doctor
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  actions: {
    // flex: 2, // Larger width for Actions
    flexDirection: 'row',

    alignItems: 'center',
    // flexWrap: 'wrap',
    width:110,
    // backgroundColor:"red", 
  },
  actionButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 5,
    // marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PatientManagement;