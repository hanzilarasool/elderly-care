// frontend/screens/PatientProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const PatientProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // For viewing documents

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = JSON.parse(await AsyncStorage.getItem('user'));
        setUser(userData);
        setName(userData.name);
        setAge(userData.age?.toString() || '');
        setGender(userData.gender || '');
        setProfileImage(userData.profileImage || null);

        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicalHistory(response.data.user.medicalHistory || []);
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await uploadProfileImage(uri);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/user/upload-profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newProfileImage = response.data.profileImage;
      setProfileImage(newProfileImage);
      setUser({ ...user, profileImage: newProfileImage });
      await AsyncStorage.setItem('user', JSON.stringify({ ...user, profileImage: newProfileImage }));
    } catch (error) {
      console.error('Error uploading profile image:', error.response?.data || error.message);
      setProfileImage(user.profileImage);
      alert('Failed to upload profile image: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`http://${IP_ADDRESS}:5000/api/user/me`, {
        name,
        age: parseInt(age),
        gender,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error.response?.data || error.message);
      alert('Failed to save profile: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderCheckupReport = ({ item, index }) => {
    const vitalData = item.vitals.map((vital, vitalIndex) => ({
      srNo: vitalIndex + 1,
      vital: vital.name.charAt(0).toUpperCase() + vital.name.slice(1),
      report: vital.value,
      document: vital.document || 'N/A',
    }));

    return (
      <View>
        {vitalData.map((vitalItem) => (
          <View key={`${index}-${vitalItem.srNo}`} style={styles.reportRow}>
            <Text style={styles.reportText}>{vitalItem.srNo}</Text>
            <Text style={styles.reportText}>{vitalItem.vital}</Text>
            <Text style={styles.reportText}>{vitalItem.report}</Text>
            {vitalItem.document !== 'N/A' ? (
              <TouchableOpacity onPress={() => setSelectedDocument(vitalItem.document)}>
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

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      {user ? (
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={isEditing ? pickImage : null}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage.startsWith('http') ? profileImage : `http://${IP_ADDRESS}:5000${profileImage}` }
                  : require("../assets/icons/profile.png")
              }
              style={styles.profileImage}
            />
            {isEditing && (
              <Ionicons name="camera" size={24} color="white" style={styles.cameraIcon} />
            )}
          </TouchableOpacity>

          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#676054"
              />
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor="#676054"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Enter your gender (M/F/Other)"
                placeholderTextColor="#676054"
              />
            </>
          ) : (
            <>
              <Text style={styles.name}>{name}</Text>
            <View style={{flexDirection:"row",gap:10}}>  <Text style={styles.detail}>Age: {age || 'N/A'}</Text>
            <View style={{backgroundColor:"white",width:2.5,height:17}}></View>
            <Text style={styles.detail}>Gender: {gender || 'N/A'}</Text>
            </View>
              <TouchableOpacity style={styles.medicalConditionButton}>
                <Text style={styles.medicalConditionText}>
                  {medicalHistory.length > 0 && medicalHistory[0].diseases.length > 0
                    ? medicalHistory[0].diseases.map(d => d.name).join(', ')
                    : 'No Medical Conditions'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsEditing(!isEditing)}
          >
            <View style={{display:"flex",flexDirection:"row"}}>{isEditing ? <Text style={styles.buttonText}>Cancel</Text> : <Text style={styles.buttonText}>Edit Profile</Text>}</View>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.reportHeader}>
            <Text style={styles.headerText}>Sr.No</Text>
            <Text style={styles.headerText}>Vital/Disease</Text>
            <Text style={styles.headerText}>Rate/Report</Text>
            <Text style={styles.headerText}>Document</Text>
          </View>
          <FlatList
            data={medicalHistory}
            renderItem={renderCheckupReport}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.emptyText}>No medical history available.</Text>}
            style={styles.medicalHistoryList}
            contentContainerStyle={styles.medicalHistoryContent}
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
    flex: 1,
    alignItems: 'center',
    width: '100%',
    // backgroundColor:"red"
  },
  profileImage: {
    width: 140,
    height: 130,
    borderRadius: 7,
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
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  medicalConditionButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  medicalConditionText: {
    fontSize: 14,
    color: '#333',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
    flexDirection:"row"

  },
  buttonText: {
    color: 'white',
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
    width: '100%',
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
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 2,
    width: '100%',
    minHeight: 50,
  },
  reportText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
  },
  medicalHistoryList: {
    width: '100%',
    flexGrow: 0,
  },
  medicalHistoryContent: {
    paddingBottom: 20,
  },
  // New styles for document viewer
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
});

export default PatientProfile;