import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { Accelerometer } from 'expo-sensors';

const IP_ADDRESS = Constants.expoConfig?.extra?.IP_ADDRESS || 'localhost'; // Fallback to 'localhost' if undefined

const PatientProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [locationCoords, setLocationCoords] = useState('Unknown');
  const [locationAddress, setLocationAddress] = useState('Unknown');
  const [fallDetected, setFallDetected] = useState(false);

  const ACCELERATION_THRESHOLD = 2.5;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const userData = JSON.parse(await AsyncStorage.getItem('user') || '{}');
        setUser(userData);
        setName(userData.name || '');
        setAge(userData.age?.toString() || '');
        setGender(userData.gender || '');
        setProfileImage(userData.profileImage || null);

        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const medicalHistoryData = Array.isArray(response.data.user.medicalHistory)
          ? response.data.user.medicalHistory
          : [];
        setMedicalHistory(medicalHistoryData);
        const lastKnown = response.data.user.lastKnownLocation || 'Unknown';
        setLocationCoords(lastKnown);
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        if (lastKnown !== 'Unknown') {
          const [lat, lon] = lastKnown.split(', ').map(Number);
          if (!isNaN(lat) && !isNaN(lon)) {
            const address = await reverseGeocode(lat, lon);
            setLocationAddress(address);
          } else {
            setLocationAddress('Invalid Coordinates');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setMedicalHistory([]);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const newLocationCoords = `${loc.coords.latitude}, ${loc.coords.longitude}`;
        setLocationCoords(newLocationCoords);

        if (!isNaN(loc.coords.latitude) && !isNaN(loc.coords.longitude)) {
          const address = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
          setLocationAddress(address);
        } else {
          setLocationAddress('Invalid Coordinates');
        }

        const token = await AsyncStorage.getItem('token');
        if (token) {
          await axios.patch(
            `http://${IP_ADDRESS}:5000/api/user/me`,
            { lastKnownLocation: newLocationCoords },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.error('Error updating location:', error.message);
      }
    })();
  }, []);

  useEffect(() => {
    let subscription;
    const startFallDetection = async () => {
      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
        if (totalAcceleration > ACCELERATION_THRESHOLD && !fallDetected) {
          handleFallDetected();
        }
      });
      Accelerometer.setUpdateInterval(100);
    };

    startFallDetection();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [fallDetected]);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid latitude or longitude');
      }
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const { street, city, region, country } = result[0];
        return `${street || ''} ${city || ''}, ${region || ''}, ${country || ''}`.trim() || 'Unknown Address';
      }
      return 'Unknown Address';
    } catch (error) {
      console.error('Error reverse geocoding:', error.message);
      return 'Unknown Address';
    }
  };

  const handleFallDetected = async () => {
    setFallDetected(true);
    Alert.alert("⚠️ Fall Detected!", "Emergency alert sent to your doctor!");

    try {
      const token = await AsyncStorage.getItem('token');
      const userData = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      if (!token || !userData.email) throw new Error('Missing token or user data');

      const response = await axios.post(
        `http://${IP_ADDRESS}:5000/api/falls/detect`,
        {
          email: userData.email,
          location: locationCoords,
          doctorId: userData.doctor,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Fall alert sent:", response.data);
      setTimeout(() => setFallDetected(false), 5000);
    } catch (error) {
      console.error("❌ Error sending fall alert:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to send fall alert: " + (error.response?.data?.error || error.message));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await uploadProfileImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

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
      setUser(prevUser => ({ ...prevUser, profileImage: newProfileImage }));
      await AsyncStorage.setItem('user', JSON.stringify({ ...user, profileImage: newProfileImage }));
    } catch (error) {
      console.error('Error uploading profile image:', error.response?.data || error.message);
      setProfileImage(user?.profileImage || null);
      Alert.alert('Error', 'Failed to upload profile image: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.patch(`http://${IP_ADDRESS}:5000/api/user/me`, {
        name,
        age: age ? parseInt(age, 10) : null,
        gender,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save profile: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderCheckupReport = ({ item, index }) => {
    const vitalData = Array.isArray(item.vitals) ? item.vitals.map((vital, vitalIndex) => ({
      srNo: vitalIndex + 1,
      vital: vital.name ? vital.name.charAt(0).toUpperCase() + vital.name.slice(1) : 'Unknown',
      report: vital.value || 'N/A',
      document: vital.document || 'N/A',
    })) : [];

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
          <View style={styles.profileSectionTop}>
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
              <View style={styles.EditProfileRightSection}>
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
              </View>
            ) : (
              <View style={styles.righSectionProfile}>
                <Text style={styles.name}>{name || 'Unnamed'}</Text>
                <View style={styles.ageGender}>
                  <Text style={styles.detail}>Age: {age || 'N/A'}</Text>
                  <Text style={styles.detail}>Gender: {gender || 'N/A'}</Text>
                </View>
                <TouchableOpacity style={styles.medicalConditionButton}>
                  <Text style={styles.medicalConditionText}>
                    {medicalHistory.length > 0 && medicalHistory[0]?.diseases?.length > 0
                      ? medicalHistory[0].diseases.map(d => d.name).join(', ')
                      : 'No Medical Conditions'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.detail}>
                  <Text style={{ fontWeight: "bold" }}>Location:</Text> {locationAddress}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.buttonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

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
            keyExtractor={(item) => item._id?.toString() || `${Math.random()}`} // Fallback for missing _id
            ListEmptyComponent={<Text style={styles.emptyText}>No medical history available.</Text>}
            style={styles.medicalHistoryList}
            contentContainerStyle={styles.medicalHistoryContent}
          />

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
                      style={[styles.button, { marginTop: 20 }]}
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
  profileSectionTop: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    height: 165,
    gap: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ageGender: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    width: "50%",
  },
  EditProfileRightSection: {
    flexDirection: "column",
    width: "65%",
  },
  righSectionProfile: {
    // backgroundColor:"red",
    // width:500
  },
  medicalConditionButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 5,
    width: "auto",
    alignSelf: 'flex-start',
  },
  medicalConditionText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    height: 38,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
    color: '#6e6e6d',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9a4b4b',
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
    // backgroundColor:"yellow",
    height:"65%"
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