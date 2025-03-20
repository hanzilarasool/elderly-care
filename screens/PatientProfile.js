// frontend/screens/PatientProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
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
              <TouchableOpacity onPress={() => alert('Document viewing not implemented yet')}>
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
              <Text style={styles.detail}>Age: {age || 'N/A'}</Text>
              <Text style={styles.detail}>Gender: {gender || 'N/A'}</Text>
              <TouchableOpacity style={styles.medicalConditionButton}>
                <Text style={styles.medicalConditionText}>
                  {medicalHistory.length > 0 && medicalHistory[0].diseases.length > 0
                    ? medicalHistory[0].diseases.join(', ')
                    : 'No Medical Conditions'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.buttonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
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
            style={styles.medicalHistoryList} // Add explicit styling
            contentContainerStyle={styles.medicalHistoryContent}
          />
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
    flex: 1, // Allow profileSection to take available space
    alignItems: 'center',
    width: '100%', // Ensure it spans the full width
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
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
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
    width: '100%', // Ensure header spans full width
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
    padding: 15, // Increased padding for better visibility
    borderRadius: 8,
    marginBottom: 5,
    elevation: 2,
    width: '100%', // Ensure row spans full width
    minHeight: 50, // Ensure enough height for content
  },
  reportText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5, // Add padding to prevent text overlap
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
    width: '100%', // Ensure FlatList takes full width
    flexGrow: 0, // Prevent FlatList from growing infinitely
  },
  medicalHistoryContent: {
    paddingBottom: 20, // Add padding at the bottom for scroll
  },
});

export default PatientProfile;