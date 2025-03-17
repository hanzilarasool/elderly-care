import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  // Static doctor data
  const doctorProfile = {
    name: "DR.Shabnum",
    specialization: "Geriatric Medicine",
    hospital: "City General Hospital",
    experience: "15 years",
    contact: "sarah.j@hospital.com",
    patients: ["harry", "tom", " jerry"]
  };

  return (
    <LinearGradient
      colors={['#201919', '#810202']}
      start={{ x: 0.48, y: 0 }}
      end={{ x: 0.99, y: 0.41 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image
            source={require("../assets/icons/profile.png")}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{doctorProfile.name}</Text>
          <Text style={styles.specialization}>{doctorProfile.specialization}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hospital:</Text>
            <Text style={styles.detailValue}>{doctorProfile.hospital}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Experience:</Text>
            <Text style={styles.detailValue}>{doctorProfile.experience}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{doctorProfile.contact}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Assigned Patients</Text>
          {doctorProfile.patients.map((patient, index) => (
            <View key={index} style={styles.patientItem}>
              <Text style={styles.patientName}>{patient}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    marginBottom: 5,
  },
  specialization: {
    fontSize: 16,
    color: "#bbb7b0",
  },
  detailsCard: {
    backgroundColor: "#222222",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#F00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    color: "#F00",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    color: "#6d7781",
    fontSize: 16,
    width: "40%",
  },
  detailValue: {
    color: "#bbb7b0",
    fontSize: 16,
    width: "60%",
  },
  patientItem: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  patientName: {
    color: "#bbb7b0",
    fontSize: 16,
  },
});

export default ProfileScreen;