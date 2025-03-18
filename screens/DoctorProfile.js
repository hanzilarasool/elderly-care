import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const IP_ADDRESS = "192.168.8.102";

const DoctorProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(await AsyncStorage.getItem('user'));
      setUser(userData);

      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data.user.patients || []);
      setSpecialization(response.data.user.specialization || '');
    };
    fetchProfile();
  }, []);

  const handleCompleteProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    await axios.patch(`http://${IP_ADDRESS}:5000/api/user/me`, { specialization }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setModalVisible(false);
  };

  const renderPatient = ({ item }) => (
    <TouchableOpacity style={styles.patientCard} onPress={() => navigation.navigate('PatientDetails', { patientId: item._id })}>
      <Text style={styles.patientName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      {user && (
        <View style={styles.profileSection}>
          <Image source={require("../assets/icons/profile.png")} style={styles.profileImage} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.specialization}>{specialization || 'Specialization not set'}</Text>

          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Complete Profile</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Assigned Patients</Text>
          <FlatList
            data={patients}
            renderItem={renderPatient}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text>No patients assigned yet.</Text>}
          />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Specialization"
              value={specialization}
              onChangeText={setSpecialization}
            />
            <TouchableOpacity style={styles.button} onPress={handleCompleteProfile}>
              <Text style={styles.buttonText}>Save</Text>
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
  container: { flex: 1, padding: 20 },
  profileSection: { alignItems: 'center' },
  profileImage: { width: 100, height: 100, marginBottom: 20 },
  name: { fontSize: 24, fontWeight: '600', color: '#333' },
  specialization: { fontSize: 16, color: '#666', marginBottom: 20 },
  button: { backgroundColor: 'black', padding: 15, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  patientCard: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2 },
  patientName: { fontSize: 16, color: '#333' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 20 },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#666', textAlign: 'center' },
});

export default DoctorProfile;