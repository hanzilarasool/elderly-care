// frontend/screens/AwarenessDetails.js
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AwarenessDetails = ({ route }) => {
  const { awareness } = route.params;

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <Image source={{ uri: awareness.image }} style={styles.image} />
      <Text style={styles.title}>{awareness.title}</Text>
      <Ionicons name={awareness.icon} size={50} color="#00796B" style={styles.icon} />
      <Text style={styles.detailsTitle}>Tips for You:</Text>
      <FlatList
        data={awareness.details}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>• {item}</Text>
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
    alignItems: 'center',
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
  icon: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#00796B',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  detailItem: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AwarenessDetails;