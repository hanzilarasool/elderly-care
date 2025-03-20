// frontend/screens/Precautions.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const precautionsData = [
  {
    id: '1',
    title: 'Wear a Mask for Respiratory Infections',
    text: 'Wear a mask when treating patients with respiratory infections (e.g., COPD, pneumonia).',
    image: 'https://images.unsplash.com/photo-1605684954998-685c79d6a018?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Masks are essential to prevent the spread of respiratory infections, especially in elderly patients with compromised lung function.',
    keyPoints: [
      'Use N95 or surgical masks for maximum protection.',
      'Ensure a snug fit over the nose and mouth.',
      'Replace masks if they become damp or soiled.',
    ],
  },
  {
    id: '2',
    title: 'Use Gloves for Infectious Diseases',
    text: 'Use gloves for patients with infectious diseases or open wounds.',
    image: 'https://plus.unsplash.com/premium_photo-1663051002044-6db5603305ab?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Gloves protect both the doctor and patient from cross-contamination during examinations or procedures.',
    keyPoints: [
      'Wear sterile gloves for open wounds.',
      'Dispose of gloves after each patient interaction.',
      'Wash hands after removing gloves.',
    ],
  },
  {
    id: '3',
    title: 'Ensure Proper Hand Hygiene',
    text: 'Ensure proper hand hygiene before and after patient contact.',
    image: 'https://plus.unsplash.com/premium_photo-1682097531633-aa0773770530?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Hand hygiene is a critical step to reduce infection risk in elderly care settings.',
    keyPoints: [
      'Use soap and water or alcohol-based sanitizer.',
      'Wash for at least 40-60 seconds.',
      'Pay attention to areas between fingers and under nails.',
    ],
  },
  {
    id: '4',
    title: 'Monitor for Dehydration',
    text: 'Monitor for dehydration in patients with fever or diarrhea.',
    image: 'https://plus.unsplash.com/premium_photo-1729537378593-c671a38972ea?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Elderly patients are prone to dehydration, which can worsen existing conditions.',
    keyPoints: [
      'Check for signs like dry mouth or sunken eyes.',
      'Encourage fluid intake (e.g., water, oral rehydration solutions).',
      'Monitor urine output and color.',
    ],
  },
  {
    id: '5',
    title: 'Avoid Sudden Movements for Osteoporosis',
    text: 'Avoid sudden movements when assisting patients with osteoporosis.',
    image: 'https://plus.unsplash.com/premium_photo-1661751442896-f7cad810317c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Sudden movements can increase fracture risk in patients with brittle bones.',
    keyPoints: [
      'Assist gently and slowly when repositioning.',
      'Use support devices like walkers if needed.',
      'Educate patients on safe movement techniques.',
    ],
  },
  {
    id: '6',
    title: 'Check Blood Pressure Regularly',
    text: 'Check blood pressure regularly for patients with hypertension.',
    image: 'https://plus.unsplash.com/premium_photo-1661322794154-b504d4f004c2?q=80&w=2096&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Regular monitoring helps manage hypertension, a common condition in the elderly.',
    keyPoints: [
      'Use a calibrated blood pressure monitor.',
      'Record readings consistently (e.g., morning and evening).',
      'Report persistent high readings to a specialist.',
    ],
  },
  {
    id: '7',
    title: 'Maintain a Safe Environment',
    text: 'Maintain a safe environment to prevent falls in elderly patients.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Falls are a leading cause of injury in the elderly, requiring proactive prevention.',
    keyPoints: [
      'Remove tripping hazards like loose rugs.',
      'Install grab bars in bathrooms and hallways.',
      'Ensure adequate lighting in all areas.',
    ],
  },
  {
    id: '8',
    title: 'Monitor Medication Adherence',
    text: 'Monitor medication adherence for patients with chronic conditions.',
    image: 'https://plus.unsplash.com/premium_photo-1716764060397-a4037aec3605?q=80&w=2137&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Ensuring elderly patients take medications correctly improves treatment outcomes.',
    keyPoints: [
      'Use pill organizers to simplify dosing.',
      'Review prescriptions for potential interactions.',
      'Educate patients or caregivers on schedules.',
    ],
  },
];

const Precautions = ({ navigation }) => (
  <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
    <Text style={styles.title}>Precautions for Elderly Care</Text>
    <FlatList
      data={precautionsData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={styles.itemContainer}
        //   onPress={() => navigation.navigate('PrecautionDetails', { precaution: item })}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.text}>{item.text}</Text>
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => navigation.navigate('PrecautionDetails', { precaution: item })}
          >
            <Text style={styles.seeMoreText}>See More...</Text>
          </TouchableOpacity>
        </View>
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
height:120,
    marginBottom: 15,
    elevation: 3,
    position: 'relative', // Needed for absolute positioning of button
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  text: {
    flex: 1,
    // width:"%",
    fontSize: 16,
    color: '#333',

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

export default Precautions;