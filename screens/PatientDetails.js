// frontend/screens/PatientDetails.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const PatientDetails = ({ route }) => {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patientData = response.data.user.patients.find(p => p._id === patientId);
        setPatient(patientData);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };
    fetchPatient();
  }, [patientId]);

  const renderCheckupReport = ({ item, index }) => {
    // Use the new vitals array structure from the updated backend
    const vitalData = item.vitals.map((vital, vitalIndex) => ({
      vital: vital.name.charAt(0).toUpperCase() + vital.name.slice(1),
      report: vital.value || 'N/A',
      status: vital.status || 'N/A',
      document: vital.document || null, // Document tied to this specific vital
    }));

    return (
      <FlatList
        data={vitalData}
        renderItem={({ item: vitalItem, index: vitalIndex }) => (
          <View style={styles.reportRow}>
            <Text style={styles.reportText}>{index * vitalData.length + vitalIndex + 1}</Text>
            <Text style={styles.reportText}>{vitalItem.vital}</Text>
            <Text style={styles.reportText}>{vitalItem.report}</Text>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.reportText,
                  {
                    color:
                      vitalItem.status === 'Normal' || vitalItem.status === 'OK'
                        ? 'green'
                        : vitalItem.status === 'Low'
                        ? 'orange'
                        : vitalItem.status === 'High'
                        ? 'red'
                        : vitalItem.status === 'Danger'
                        ? 'purple'
                        : 'black',
                  },
                ]}
              >
                {vitalItem.status}
              </Text>
              {vitalItem.document && (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setSelectedDocument(vitalItem.document)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item, index) => `vital-${index}`}
      />
    );
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      {patient ? (
        <View style={styles.profileSection}>
          <View style={styles.profilePart}>
            <Image
              source={
                patient.profileImage
                  ? { uri: `http://${IP_ADDRESS}:5000${patient.profileImage}` }
                  : require('../assets/icons/profile.png')
              }
              style={styles.profileImage}
            />
            <View>
              <Text style={styles.name}>{patient.name}</Text>
              <View style={styles.genderAge}>
                <Text style={styles.detail}>Age: {patient.age || 'N/A'}</Text>
                <View style={{ backgroundColor: 'white', height: 16, width: 3 }}></View>
                <Text style={styles.detail}>Gender: {patient.gender || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Last Checkup Reports</Text>
          <View style={styles.reportHeader}>
            <Text style={styles.headerText}>Sr.No</Text>
            <Text style={styles.headerText}>Vital</Text>
            <Text style={styles.headerText}>Rate/Report</Text>
            <Text style={styles.headerText}>Status</Text>
          </View>
          <FlatList
            data={patient.medicalHistory || []}
            renderItem={renderCheckupReport}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No checkup reports available.</Text>}
          />

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
                    <Image
                      source={{ uri: `http://${IP_ADDRESS}:5000${selectedDocument}` }}
                      style={styles.documentImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedDocument(null)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    // alignItems: 'center',
  },
  profilePart: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    height: 150,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    gap: 24,
  },
  profileImage: {
    width: 130,
    height: 150,
    borderRadius: 10,
    // marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  genderAge: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
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
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  viewButton: {
    backgroundColor: '#00796B',
    padding: 5,
    borderRadius: 5,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  documentImage: {
    width: '100%',
    height: 400,
  },
  closeButton: {
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PatientDetails;