// components/EditMedicineModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet } from 'react-native';

const EditMedicineModal = ({ visible, onClose, onSubmit, medicine }) => {
  const [medicineData, setMedicineData] = useState({
    name: '',
    dosage: '',
    time: 'Morning'
  });

  useEffect(() => {
    if (medicine) {
      setMedicineData({
        name: medicine.name,
        dosage: medicine.dosage,
        time: medicine.time
      });
    }
  }, [medicine]);

  const handleSubmit = () => {
    onSubmit(medicineData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Medicine</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Medicine Name"
            value={medicineData.name}
            onChangeText={(text) => setMedicineData({...medicineData, name: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Dosage (e.g., 10mg)"
            value={medicineData.dosage}
            onChangeText={(text) => setMedicineData({...medicineData, dosage: text})}
          />

          <View style={styles.timeSelector}>
            {['Morning', 'Midday', 'Night'].map((time) => (
              <Pressable
                key={time}
                style={[styles.timeButton, medicineData.time === time && styles.selectedTime]}
                onPress={() => setMedicineData({...medicineData, time})}
              >
                <Text style={medicineData.time === time ? styles.selectedTimeText : styles.timeText}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Update Medicine</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Use same styles as AddMedicineModal
const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      margin: 20,
      padding: 20,
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#00796B',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    timeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    timeButton: {
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    selectedTime: {
      backgroundColor: '#00796B',
      borderColor: '#00796B',
    },
    timeText: {
      color: '#333',
    },
    selectedTimeText: {
      color: 'white',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#ddd',
    },
    submitButton: {
      backgroundColor: '#00796B',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

export default EditMedicineModal;