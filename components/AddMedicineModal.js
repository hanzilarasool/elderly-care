// components/AddMedicineModal.js
import React, { useState } from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet } from 'react-native';

const AddMedicineModal = ({ visible, onClose, onSubmit }) => {
  const [medicineData, setMedicineData] = useState({
    name: '',
    dosage: '',
    time: 'Morning'
  });

//   const handleSubmit = () => {
//     onSubmit(medicineData);
//     setMedicineData({ name: '', dosage: '', time: 'Morning' });
//     onClose();
//   };
const handleSubmit = () => {
    if (!medicineData.name || !medicineData.dosage) {
      alert('Please fill all fields');
      return;
    }
    onSubmit(medicineData);
    setMedicineData({ name: '', dosage: '', time: 'Morning' });
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Medicine</Text>
          
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
              <Text style={styles.buttonText}>Add Medicine</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

export default AddMedicineModal;