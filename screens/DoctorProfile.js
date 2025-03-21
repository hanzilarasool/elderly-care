// frontend/screens/DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import ChatAssistantModal from '../components/ChatAssistantModal';

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const DoctorProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
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
      setPatients(response.data.user.patients || []);
      setFilteredPatients(response.data.user.patients || []);
      setSpecialization(response.data.user.specialization || '');
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
      console.error('Error uploading profile image:', error);
      setProfileImage(user.profileImage);
    }
  };

  const handleCompleteProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`http://${IP_ADDRESS}:5000/api/user/me`, {
        name,
        age: parseInt(age),
        gender,
        specialization,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSearch = (query) => {
    if (query.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  // Updated to call handleSearch on text change
  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    handleSearch(text); // Call handleSearch with the current text
  };

  const renderPatient = ({ item, index }) => (
    <View style={styles.patientRow}>
      <Text style={styles.patientText}>{index + 1}</Text>
      <Text style={styles.patientText}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PatientDetails', { patientId: item._id })}
        >
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#00796B' }]}
          onPress={() => navigation.navigate('EditPatient', { patientId: item._id })}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <View style={{ position: "relative", height: "100%" }}>
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.profilePart}>
              <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                <Image
                  source={profileImage ? { uri: profileImage.startsWith('http') ? profileImage : `http://${IP_ADDRESS}:5000${profileImage}` } : require("../assets/icons/profile.png")}
                  style={styles.profileImage}
                />
                <Ionicons name="camera" size={24} color="white" style={styles.cameraIcon} />
              </TouchableOpacity>
              <View style={styles.personalInfo}>
                <Text style={styles.name}>{user.name}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 15, alignItems: "center" }}>
                  <Text style={styles.detail}>Age: {user.age || 'N/A'}</Text>
                  <View style={{ width: 3, height: 15, backgroundColor: "white" }}></View>
                  <Text style={styles.detail}>Gender: {user.gender || 'N/A'}</Text>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
                  <Text style={{ fontWeight: "400", fontSize: 15, color: "#333" }}>Field:</Text>
                  <Text style={styles.specialization}>{specialization || 'Specialization not set'}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Assigned Patients</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Patient by Name"
                value={searchQuery}
                onChangeText={handleSearchInputChange} // Updated to trigger search on text change
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchQuery)}>
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.patientHeader}>
              <Text style={styles.headerText}>Sr.No</Text>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Actions</Text>
            </View>
            <FlatList
              data={filteredPatients}
              renderItem={renderPatient}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={<Text style={styles.emptyText}>No patients assigned yet.</Text>}
            />
          </View>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Your Profile</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Gender (M/F/Other)"
                value={gender}
                onChangeText={setGender}
              />
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
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowChat(true)}
        >
          <Image source={require("../assets/icons/ai.png")} style={styles.aiIcon} />
        </TouchableOpacity>

        <ChatAssistantModal
          visible={showChat}
          onClose={() => setShowChat(false)}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profilePart: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    height: 150,
    gap: 10,
  },
  profileSection: {
    // alignItems: 'center',
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    backgroundColor: "white",
  },
  profileImage: {
    width: "99%",
    height: "98%",
    borderRadius: 10,
    marginBottom: 10,
    objectFit: "contain",
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#00796B',
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  patientHeader: {
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
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 2,
    alignItems: 'center',
  },
  patientText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
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
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 22,
    right: 8,
    backgroundColor: '#0288D1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 100,
  },
  aiIcon: {
    width: 32,
    height: 29,
  },
});

export default DoctorProfile;