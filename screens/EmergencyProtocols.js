// frontend/screens/EmergencyProtocols.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const emergencyData = [
  {
    id: '1',
    title: 'Heart Attack',
    text: 'Recognize and respond to a heart attack in elderly patients.',
    image: 'https://plus.unsplash.com/premium_photo-1718955640503-2e26751bf9ab?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Heart-related image
    description: 'A heart attack requires immediate action to save an elderly patient’s life, as symptoms may be subtle or atypical (e.g., jaw pain instead of chest pain).',
    steps: [
      'Call emergency services (e.g., 911) immediately.',
      'If trained, administer CPR if the patient stops breathing.',
      'Provide aspirin (if not allergic) to thin blood.',
      'Keep the patient calm and seated until help arrives.',
    ],
  },
  {
    id: '2',
    title: 'Stroke',
    text: 'Identify and act quickly during a stroke.',
    image: 'https://plus.unsplash.com/premium_photo-1681426643645-77d6b5130b50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Brain-related image
    description: 'Strokes are time-sensitive emergencies in the elderly; rapid response can minimize brain damage.',
    steps: [
      'Use FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services.',
      'Call emergency services immediately.',
      'Do not give food or drink to avoid choking.',
      'Note the time symptoms started for medical staff.',
    ],
  },
  {
    id: '3',
    title: 'Severe Bleeding',
    text: 'Control severe bleeding from cuts or injuries.',
    image: 'https://ssl.adam.com/graphics/images/en/1067.jpg', // Bandage image
    description: 'Elderly patients on blood thinners are at higher risk for severe bleeding, requiring quick intervention.',
    steps: [
      'Apply firm pressure to the wound with a clean cloth.',
      'Elevate the injured area if possible.',
      'Call emergency services if bleeding doesn’t stop.',
      'Do not remove the cloth; add more layers if needed.',
    ],
  },
  {
    id: '4',
    title: 'Choking',
    text: 'Respond to choking incidents in elderly patients.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx3lTPMMFZukEavbBHlG7VZKykGg7lfXewag&s', // Throat-related image
    description: 'Choking is a common emergency in the elderly due to swallowing difficulties; prompt action is critical.',
    steps: [
      'Ask if they can speak; if not, proceed.',
      'Perform the Heimlich maneuver if trained.',
      'Call emergency services if unable to dislodge blockage.',
      'Stay with the patient until help arrives.',
    ],
  },
  {
    id: '5',
    title: 'Falls',
    text: 'Handle falls to prevent further injury.',
    image: 'https://resources.amedisys.com/hubfs/Fall-Precautions.png', // Elderly fall image
    description: 'Falls are frequent in the elderly and can lead to fractures or head injuries if not managed properly.',
    steps: [
      'Do not move the patient if they report severe pain or cannot move.',
      'Call emergency services for suspected fractures or head injury.',
      'Provide first aid for minor cuts or bruises.',
      'Assess for concussion symptoms (e.g., confusion).',
    ],
  },
];

const EmergencyProtocols = ({ navigation }) => (
  <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
    <Text style={styles.title}>Emergency Protocols</Text>
    <FlatList
      data={emergencyData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => navigation.navigate('EmergencyDetails', { emergency: item })}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.text}>{item.text}</Text>
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => navigation.navigate('EmergencyDetails', { emergency: item })}
          >
            <Text style={styles.seeMoreText}>See More...</Text>
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    position: 'relative',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  seeMoreButton: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    backgroundColor: '#D32F2F', // Red for emergency theme
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

export default EmergencyProtocols;