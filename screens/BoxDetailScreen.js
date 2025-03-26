// Screens/BoxDetailScreen.js
import React, { useContext,useState,useEffect } from 'react';
import { View, Text, StyleSheet,Image,Pressable } from 'react-native';
import { useBoxes } from '../contexts/BoxesContext';
import AddMedicineModal from '../components/AddMedicineModal';
import EditMedicineModal from '../components/EditMedicineModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BoxDetailScreen = () => {
  const { state,addMedicine,deleteMedicine,updateMedicine } = useBoxes();
  const selectedBox = state.boxes?.find(box => box._id === state.selectedBox);
// states to handle modal visiblity
const [modalVisible, setModalVisible] = useState(false);
const [editModalVisible, setEditModalVisible] = useState(false);
const [selectedMedicine, setSelectedMedicine] = useState(null);

// taken medicine handling
const [takenStatus, setTakenStatus] = useState({});
// Load taken status from storage when component mounts
useEffect(() => {
  loadTakenStatus();
  setupDailyReset();
}, []);

// Load taken status from AsyncStorage
// Load taken status from AsyncStorage
const loadTakenStatus = async () => {
  try {
    const storedStatus = await AsyncStorage.getItem('medicineTakenStatus');
    if (storedStatus) {
      setTakenStatus(JSON.parse(storedStatus));
    }
  } catch (error) {
    console.error('Error loading taken status:', error);
  }
};

// Save taken status to AsyncStorage
const saveTakenStatus = async (newStatus) => {
  try {
    await AsyncStorage.setItem('medicineTakenStatus', JSON.stringify(newStatus));
  } catch (error) {
    console.error('Error saving taken status:', error);
  }
};

// Reset status at midnight
const setupDailyReset = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  setTimeout(() => {
    setTakenStatus({});
    saveTakenStatus({});
    // Set up next day's reset
    setInterval(() => {
      setTakenStatus({});
      saveTakenStatus({});
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

const toggleTakenStatus = (medicineId) => {
  const newStatus = {
    ...takenStatus,
    [medicineId]: !takenStatus[medicineId]
  };
  setTakenStatus(newStatus);
  saveTakenStatus(newStatus);
};
// handle add medicine

const handleAddMedicine = async (medicineData) => {
    try {
      await addMedicine(state.selectedBox, medicineData);
      // Force re-render by updating local state
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };
// Handle edit medicine
const handleEditMedicine = async (medicineData) => {
    try {
      await updateMedicine(
        state.selectedBox, 
        selectedMedicine._id, 
        medicineData
      );
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating medicine:', error);
    }
  };
// Add delete handler
const handleDeleteMedicine = async (medicineId) => {
    try {
      await deleteMedicine(state.selectedBox, medicineId);
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };
  if (!selectedBox) {
    return (
      <View style={styles.container}>
        <Text>No box selected or box not found.</Text>
      </View>
    );
  }
  if (state.loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
         <AddMedicineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddMedicine}
      />
      
          <View style={styles.boxContainer}>
          <View>
                     <Text style={styles.boxTitle}>{selectedBox.name}</Text>
               <View style={styles.timerContainer}  >
                  <Image source={require("../assets/icons/clock.png")} style={styles.clockIcon} />
               <View>
               <Text style={styles.boxDescription}>{selectedBox.description}</Text>
                {/* <Text style={styles.boxDate}>{box.date}</Text> */}
                <Text style={styles.boxTime}>{selectedBox.timeSlot}</Text>
               </View>
               </View>
                <Text style={styles.seeMore}>Details below</Text>
      
                     </View>
                     <Image source={require("../assets/images/Medicine-box.png")} style={styles.medicineBoxImage} />
          </View>
      {/* <Text style={styles.title}>{selectedBox.name}</Text> */}
      {/* <Text style={styles.description}>{selectedBox.description}</Text> */}
      <Pressable style={styles.addNewMedicineContainer} onPress={() => setModalVisible(true)}>
        <Text style={{fontSize:16,fontWeight:'600',color:"white"}}>Add new Medicine</Text>
        <Image source={require("../assets/icons/plus.png")} style={{width:35,height:35}} />
      </Pressable>
      {/* <Text style={styles.sectionTitle}>Medicines:</Text> */}
      
      {selectedBox?.medicines?.length === 0 ? (
        <Text>No medicines in this box.</Text>
      ) : (
        selectedBox?.medicines?.map((medicine, index) => (
          <View key={index} style={styles.singleMedicineWrapper}>
            <View style={styles.editORDelContainer}>
            <Pressable onPress={() => {
    setSelectedMedicine(medicine);
    setEditModalVisible(true);
  }}>
    <Image source={require("../assets/icons/edit.png")} style={{width:46,height:46}} />
  </Pressable>
  <EditMedicineModal
    visible={editModalVisible}
    onClose={() => setEditModalVisible(false)}
    onSubmit={handleEditMedicine}
    medicine={selectedMedicine}
  />

           <Pressable  onPress={() => handleDeleteMedicine(medicine._id)}>
           <Image source={require("../assets/icons/delete.png")} style={{width:46,height:46}} />
           </Pressable>
            </View>
            <View style={styles.medicineContainer}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text>Dosage: {medicine.dosage}</Text>
            <Text>Time: {medicine.time}</Text>
            <Pressable 
                style={[
                  styles.statusButton,
                  takenStatus[medicine._id] && styles.takenButton
                ]}
                onPress={() => toggleTakenStatus(medicine._id)}
              >
                <View style={[
                  styles.radioCircle,
                  takenStatus[medicine._id] && styles.radioCircleFilled
                ]} />
                <Text style={[
                  styles.statusText,
                  takenStatus[medicine._id] && styles.takenText
                ]}>
                  {takenStatus[medicine._id] ? 'Taken' : 'Take'}
                </Text>
              </Pressable>
            </View>

          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },

  medicineContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: 250,
height: 110,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },

  addNewMedicineContainer:{
backgroundColor:"#00796B",
display:"flex",
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
padding:8,
marginBottom:12,
borderRadius:10,
  },


// take /taken style

statusButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
  // padding: 4,
  marginLeft:130,
  // marginBottom:20,

},
takenButton: {
  backgroundColor: '#E6F0FA',
  borderRadius: 4,
},
radioCircle: {
  width: 17,
  height: 17,
  borderRadius: 9,
  borderWidth: 2,
  borderColor: '#00796B',
  marginRight: 6,
},
radioCircleFilled: {
  backgroundColor: '#00796B',
  borderColor: '#00796B7',
},
statusText: {
  color: '#00796B',
  fontSize: 18,
  fontWeight:"500"
},
takenText: {
  fontWeight: '600',
  // fontSize:55,
},


// take taken styles ends

//   selected box styles
boxContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    display:"flex",
    flexDirection:"row",    
    justifyContent:"space-between",
    alignItems:"center",
  },
medicineBoxImage:{
    width:100,
    height:100,
    borderWidth:2,
    borderColor:"#00796B",
    borderRadius:10
      },
      boxTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: "#00796B"
      },
      boxDescription: {
        fontSize: 16,
        color: '#657C7E',
        marginBottom: 4,
      },
      boxDate: {
        fontSize: 14,
        color: '#000',
        marginBottom: 2,
      },
      boxTime: {
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
      },
      seeMore: {
        width: 190,
        // height: 26,
        backgroundColor: '#00796B',
        color: '#FFFFFF',
        borderRadius: 5,
        textAlign: 'center',
        padding: 5,
    fontSize:14,
    marginBottom:5,
    
      },
      timerContainer:{
        display:"flex",
        flexDirection:"row",
        alignItems:"center",
        
      },
      clockIcon:{
        width:21,
        height:21,
        marginRight:10,
        borderRadius:20,
      },
      singleMedicineWrapper:{
        
        display:"flex",
        flexDirection:"row",
        justifyContent:"flex-end",
        alignItems:"flex-start",
        gap:10,
        // marginBottom:10,
        // flexgap:10,
      }
      ,
      editORDelContainer:{
        display:"flex",
        flexDirection:"column",
       gap:4,
        alignItems:"center",
     
      }
     
});

export default BoxDetailScreen;