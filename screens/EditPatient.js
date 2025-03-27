import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, FlatList, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Pdf from 'react-native-pdf'; // For native platforms
import { Document, Page, pdfjs } from 'react-pdf'; // For web
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Required for react-pdf on web

// Set PDF.js worker for web
if (Platform.OS === 'web') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const IP_ADDRESS = Constants?.expoConfig?.extra?.IP_ADDRESS || '192.168.1.13';

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
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [numPages, setNumPages] = useState(null); // For web PDF

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
    if (Platform.OS === 'web') {
      // Web file picker (simplified, assumes input element usage)
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setDocument({ uri: URL.createObjectURL(file), name: file.name });
        }
      };
      input.click();
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
        });
        if (result.type === 'success') {
          setDocument(result);
        } else {
          console.log('Document picking cancelled');
        }
      } catch (error) {
        console.error('Error picking document:', error);
      }
    }
  };

  const handleAddMedicalHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const vitals = vitalName && rate ? [{ name: vitalName.toLowerCase(), value: rate, status: status || 'Normal' }] : [];

      const response = await axios.post(
        `http://${IP_ADDRESS}:5000/api/user/patient/medical-history`,
        {
          patientId,
          vitals,
          diseases: diseases ? diseases.split(',').map(d => ({ name: d.trim() })) : [],
          notes,
          status: status || 'Normal',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (document) {
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('historyId', response.data.medicalHistory[0]._id);
        if (vitals.length > 0) {
          formData.append('vitalIndex', 0);
        }
        formData.append('document', {
          uri: document.uri,
          name: document.name || `report-${Date.now()}.${document.uri.split('.').pop() || 'file'}`,
          type: document.mimeType || 'application/octet-stream',
        });

        await axios.post(`http://${IP_ADDRESS}:5000/api/user/upload-document`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

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
    const vitalData = item.vitals.map((vital, vitalIndex) => ({
      srNo: vitalIndex + 1,
      vital: vital.name.charAt(0).toUpperCase() + vital.name.slice(1),
      report: vital.value,
      document: vital.document ? vital.document : 'N/A',
    }));

    return (
      <View>
        {vitalData.map((vitalItem) => (
          <View key={`${index}-${vitalItem.srNo}`} style={styles.reportRow}>
            <Text style={styles.reportText}>{vitalItem.srNo}</Text>
            <Text style={styles.reportText}>{vitalItem.vital}</Text>
            <Text style={styles.reportText}>{vitalItem.report}</Text>
            {vitalItem.document !== 'N/A' ? (
              <TouchableOpacity
                onPress={() => {
                  console.log('Viewing document:', vitalItem.document);
                  setSelectedDocument(vitalItem.document);
                }}
              >
                <Text style={[styles.reportText, { color: '#00796B' }]}>View</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.reportText}>{vitalItem.document}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages); // For web PDF
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      {patient ? (
        <View style={styles.profileSection}>
          <View style={styles.patientProfileSection}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage.startsWith('http') ? profileImage : `http://${IP_ADDRESS}:5000${profileImage}` }
                  : require('../assets/icons/profile.png')
              }
              style={styles.profileImage}
            />
            <View style={styles.nameAgeGender}>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.genderAge}>
                <Text style={styles.detail}>Age: {age}</Text>
                <View style={{ width: 2, height: 18, backgroundColor: 'white' }} />
                <Text style={styles.detail}>Gender: {gender}</Text>
              </View>
            </View>
          </View>

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
            keyExtractor={(item) => item._id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No medical history available.</Text>}
          />
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Medical History</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}

      {/* Add Medical History Modal */}
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
            {document && (
              <Text style={styles.documentText}>
                Document Selected: {document.name || document.uri.split('/').pop()}
              </Text>
            )}
            <TouchableOpacity style={styles.button} onPress={handleAddMedicalHistory}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        visible={!!selectedDocument}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDocument(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedDocument && (
              <>
                <Text style={styles.modalTitle}>Document Viewer</Text>
                {selectedDocument.endsWith('.pdf') ? (
                  Platform.OS === 'web' ? (
                    <Document
                      file={`http://${IP_ADDRESS}:5000${selectedDocument}`}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => console.error('Web PDF load error:', error)}
                    >
                      {Array.from(new Array(numPages || 1), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={styles.documentImage.width} />
                      ))}
                    </Document>
                  ) : (
                    <Pdf
                      source={{ uri: `http://${IP_ADDRESS}:5000${selectedDocument}`, cache: true }}
                      style={styles.documentImage}
                      onError={(error) => console.error('PDF load error:', error)}
                    />
                  )
                ) : (
                  <Image
                    source={{ uri: `http://${IP_ADDRESS}:5000${selectedDocument}` }}
                    style={styles.documentImage}
                    resizeMode="contain"
                    onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
                  />
                )}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setSelectedDocument(null)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  profileSection: {},
  patientProfileSection: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 140,
    gap: 14,
  },
  nameAgeGender: { width: 'auto', gap: 10 },
  name: { fontSize: 22, fontWeight: '700' },
  genderAge: { display: 'flex', flexDirection: 'row', gap: 15 },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
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
  documentImage: {
    width: Platform.OS === 'web' ? '90%' : '100%', // Adjust for web
    height: 400,
  },
});

export default EditPatient;