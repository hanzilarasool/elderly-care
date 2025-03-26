// frontend/screens/PatientAwareness.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const awarenessData = [
  {
    id: '1',
    title: 'Stay Active',
    text: 'Learn why staying active is key to your health.',
    icon: 'walk', // Ionicons name
    image: 'https://images.ctfassets.net/plyq12u1bv8a/4bQxeLHJGETZOsJYMiER7F/f29a2034386df4658ae7004ebbc35b42/B0503_HRABlogRefresh_StayActive.png', // Exercise image
    details: [
      'Aim for 30 minutes of light activity (e.g., walking) most days.',
      'Stretching can improve flexibility and reduce stiffness.',
      'Ask your doctor before starting new exercises.',
      'Stay active to boost mood and energy!',
    ],
  },
  {
    id: '2',
    title: 'Stay Hydrated',
    text: 'Understand the importance of drinking water.',
    icon: 'water', // Ionicons name
    image: 'https://c.ndtvimg.com/2022-11/089qdk1g_benefits-of-drinking-water-before-brushing_625x300_24_November_22.jpg?downsize=773:435', // Water image
    details: [
      'Drink 6-8 glasses of water daily (unless advised otherwise).',
      'Dehydration can cause confusion or fatigue.',
      'Keep a water bottle nearby as a reminder.',
      'Fruits like watermelon also help with hydration.',
    ],
  },
  {
    id: '3',
    title: 'Mental Health',
    text: 'Tips to keep your mind healthy and happy.',
    icon: 'heart', // Ionicons name
    image: 'https://www.csipacific.ca/wp-content/uploads/2024/03/mental-health.jpg', // Mental health image
    details: [
      'Talk to friends or family regularly.',
      'Try puzzles or reading to keep your mind sharp.',
      'Feeling sad? Tell your doctor—it’s okay to ask for help.',
      'Relax with deep breathing or quiet time.',
    ],
  },
  {
    id: '4',
    title: 'Healthy Eating',
    text: 'Simple advice for better nutrition.',
    icon: 'nutrition', // Ionicons name
    image: 'https://www.healthyfood.com/wp-content/uploads/2021/05/Nutritious-hospital-food-may-help-save-heart-patients-lives-iStock-186703869-768x628.jpg', // Food image
    details: [
      'Eat fruits and veggies for vitamins and fiber.',
      'Limit sugary snacks to keep energy steady.',
      'Smaller meals might be easier to digest.',
      'Ask your doctor about foods for your health needs.',
    ],
  },
];

const PatientAwareness = ({ navigation }) => (
  <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
    <Text style={styles.title}>Patient Awareness</Text>
    <FlatList
      data={awarenessData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AwarenessDetails', { awareness: item })}
        >
          <Ionicons name={item.icon} size={40} color="#00796B" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.text}</Text>
          </View>
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => navigation.navigate('AwarenessDetails', { awareness: item })}
          >
            <Text style={styles.seeMoreText}>Learn More</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
    />
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    paddingBottom:35,
    marginBottom: 15,
    elevation: 3,
    position: 'relative',
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
  seeMoreButton: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    backgroundColor: '#00796B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default PatientAwareness;