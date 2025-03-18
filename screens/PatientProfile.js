import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const PatientProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [medicalHistory, setMedicalHistory] = useState([]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = JSON.parse(await AsyncStorage.getItem('user'));
        setUser(userData);
        setName(userData.name);

        const response = await axios.get(`http://${IP_ADDRESS}:5000/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicalHistory(response.data.user.medicalHistory || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  // Save updated profile
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`http://${IP_ADDRESS}:5000/api/user/me`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, name: response.data.user.name });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Render each medical history entry
  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyText}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      {item.vitals && (
        <>
          <Text style={styles.historyText}>Blood Pressure: {item.vitals.bloodPressure || 'N/A'}</Text>
          <Text style={styles.historyText}>Heart Rate: {item.vitals.heartRate || 'N/A'} bpm</Text>
          <Text style={styles.historyText}>Temperature: {item.vitals.temperature || 'N/A'} °C</Text>
          <Text style={styles.historyText}>Oxygen Level: {item.vitals.oxygenLevel || 'N/A'}%</Text>
        </>
      )}
      <Text style={styles.historyText}>Diseases: {item.diseases.length > 0 ? item.diseases.join(', ') : 'None'}</Text>
      <Text style={styles.historyText}>Notes: {item.notes || 'No notes'}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['white', '#F5F5F5']} style={styles.container}>
      {user ? (
        <View style={styles.profileSection}>
          <Image source={require("../assets/icons/profile.png")} style={styles.profileImage} />
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#676054"
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
          <Text style={styles.role}>Patient</Text>

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
          <FlatList
            data={medicalHistory}
            renderItem={renderHistory}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No medical history available.</Text>}
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
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    elevation: 2,
    color: '#6e6e6d',
  },
  button: {
    backgroundColor: 'black',
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
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
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
});

export default PatientProfile;