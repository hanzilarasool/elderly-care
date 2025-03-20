// frontend/screens/EditPatient.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, FlatList,StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const EditPatient = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [vitalName, setVitalName] = useState('');
  const [rate, setRate] = useState('');
  const [diseases, setDiseases] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patientData = response.data.user.patients.find(p => p._id === patientId);
        if (!patientData) {
          throw new Error('Patient not found in assigned patients');
        }
        setPatient(patientData);
        setName(patientData.name);
        setAge(patientData.age?.toString() || '');
        setGender(patientData.gender || '');
        setProfileImage(patientData.profileImage || null);
      } catch (error) {
        console.error('Error fetching patient:', error.response?.data || error.message);
      }
    };
    fetchPatient();
  }, [patientId]);

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setDocument(result.assets[0].uri);
    }
  };

  const handleAddMedicalHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const vitals = {};
      if (vitalName && rate) {
        vitals[vitalName.toLowerCase()] = rate;
      }

      const response = await axios.post(
        `http://${IP_ADDRESS}:5000/api/user/patient/medical-history`,
        {
          patientId,
          vitals,
          diseases: diseases ? diseases.split(',').map(d => d.trim()) : [],
          notes,
          status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (document) {
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('historyId', response.data.medicalHistory[0]._id); // Newest entry is at index 0
        formData.append('document', {
          uri: document,
          name: `report-${Date.now()}.${document.split('.').pop() || 'pdf'}`,
          type: 'application/octet-stream',
        });

        await axios.post(`http://${IP_ADDRESS}:5000/api/user/upload-document`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Fetch updated patient data to reflect new medical history
      const updatedResponse = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedPatient = updatedResponse.data.user.patients.find(p => p._id === patientId);
      setPatient(updatedPatient);

      setModalVisible(false);
      setVitalName('');
      setRate('');
      setDiseases('');
      setNotes('');
      setStatus('');
      setDocument(null);
    } catch (error) {
      console.error('Error adding medical history:', error.response?.data || error.message);
      alert('Failed to add medical history: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderCheckupReport = ({ item, index }) => {
    const vitalEntries = Object.entries(item.vitals || {});
    const vitalData = vitalEntries.map(([vital, value], vitalIndex) => ({
      srNo: index * vitalEntries.length + vitalIndex + 1,
      vital: vital.charAt(0).toUpperCase() + vital.slice(1),
      report: value,
      document: item.documents.length > 0 ? 'View' : 'N/A',
    }));

    return (
      <View>
        {vitalData.map((vitalItem) => (
          <View key={`${index}-${vitalItem.srNo}`} style={styles.reportRow}>
            <Text style={styles.reportText}>{vitalItem.srNo}</Text>
            <Text style={styles.reportText}>{vitalItem.vital}</Text>
            <Text style={styles.reportText}>{vitalItem.report}</Text>
            {vitalItem.document === 'View' ? (
              <TouchableOpacity onPress={() => {
                // Placeholder for document viewing logic
                alert('Document viewing not implemented yet');
              }}>
                <Text style={[styles.reportText, { color: '#00796B' }]}>{vitalItem.document}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.reportText}>{vitalItem.document}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      {patient ? (
        <View style={styles.profileSection}>
          <Image
            source={
              profileImage
                ? { uri: profileImage.startsWith('http') ? profileImage : `http://${IP_ADDRESS}:5000${profileImage}` }
                : require("../assets/icons/profile.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.detail}>Age: {age}</Text>
          <Text style={styles.detail}>Gender: {gender}</Text>

          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.reportHeader}>
            <Text style={styles.headerText}>Sr.No</Text>
            <Text style={styles.headerText}>Vital/Disease</Text>
            <Text style={styles.headerText}>Rate/Report</Text>
            <Text style={styles.headerText}>Document</Text>
          </View>
          <FlatList
            data={patient.medicalHistory || []}
            renderItem={renderCheckupReport}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.emptyText}>No medical history available.</Text>}
          />
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Medical History</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medical History</Text>
            <TextInput
              style={styles.input}
              placeholder="Vital Name (e.g., Blood Pressure)"
              value={vitalName}
              onChangeText={setVitalName}
            />
            <TextInput
              style={styles.input}
              placeholder="Rate (e.g., 120/80)"
              value={rate}
              onChangeText={setRate}
            />
            <TextInput
              style={styles.input}
              placeholder="Diseases (comma-separated)"
              value={diseases}
              onChangeText={setDiseases}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Status (Normal, High, Low, OK, Danger)"
              value={status}
              onChangeText={setStatus}
            />
            <TouchableOpacity style={styles.button} onPress={pickDocument}>
              <Text style={styles.buttonText}>Attach Document</Text>
            </TouchableOpacity>
            {document && <Text style={styles.documentText}>Document Selected: {document.split('/').pop()}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleAddMedicalHistory}>
              <Text style={styles.buttonText}>Add</Text>
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
// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    // alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 5,
  },
  input: {
    height: 50,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
    color: '#6e6e6d',
  },
  button: {
    backgroundColor: '#00796B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
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
    alignSelf: 'flex-start',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 2,
  },
  reportText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
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
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  documentText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 2,
  },
  reportText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default EditPatient;