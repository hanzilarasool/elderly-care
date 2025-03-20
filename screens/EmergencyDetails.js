// frontend/screens/EmergencyDetails.js
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const EmergencyDetails = ({ route }) => {
  const { emergency } = route.params;

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <Image source={{ uri: emergency.image }} style={styles.image} />
      <Text style={styles.title}>{emergency.title}</Text>
      <Text style={styles.description}>{emergency.description}</Text>
      <Text style={styles.stepsTitle}>Steps to Follow:</Text>
      <FlatList
        data={emergency.steps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.stepItem}>
            <Text style={styles.stepText}>• {item}</Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'justify',
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#D32F2F', // Red for emergency theme
    marginBottom: 10,
  },
  stepItem: {
    marginBottom: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
  },
});

export default EmergencyDetails;