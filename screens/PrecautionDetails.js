// frontend/screens/PrecautionDetails.js
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PrecautionDetails = ({ route }) => {
  const { precaution } = route.params;

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <Image source={{ uri: precaution.image }} style={styles.image} />
      <Text style={styles.title}>{precaution.title}</Text>
      <Text style={styles.description}>{precaution.description}</Text>
      <Text style={styles.keyPointsTitle}>Key Points:</Text>
      <FlatList
        data={precaution.keyPoints}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.keyPointItem}>
            <Text style={styles.keyPointText}>• {item}</Text>
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
  keyPointsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#00796B',
    marginBottom: 10,
  },
  keyPointItem: {
    marginBottom: 10,
  },
  keyPointText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PrecautionDetails;