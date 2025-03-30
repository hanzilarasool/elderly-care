import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import ChatAssistantModal from '../components/ChatAssistantModal';
import { BoxesContext } from '../contexts/BoxesContext';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const BoxesScreen = () => {
  const { state, fetchBoxes, selectBox } = useContext(BoxesContext);
  const navigation = useNavigation();
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchBoxes();
      await loadUserData();
      await configureNotifications();

      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        Alert.alert('Notification', notification.request.content.body);
      });

      return () => subscription.remove();
    };
    initialize();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const configureNotifications = async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        Alert.alert('Permissions Denied', 'Please enable notifications in your device settings.');
        return;
      }
      console.log('Notification permissions granted');
    } else {
      console.log('Must use physical device for notifications');
      Alert.alert('Error', 'Notifications only work on a physical device.');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared all previous notifications');
    await scheduleMedicineReminders();
  };

  const scheduleMedicineReminders = async () => {
    const boxes = state.boxes || [];
    if (!boxes.length) {
      console.log('No boxes available');
      return;
    }

    const notificationTimes = [
      { label: 'Morning Medication', hour: 10, minute: 20, displayTime: '8:00 AM' },
      { label: 'Midday Medication', hour: 13, minute: 0, displayTime: '1:00 PM' },
      { label: 'Night Medication', hour: 21, minute: 0, displayTime: '9:00 PM' },
    ];

    const notificationPromises = notificationTimes.map(async (time, index) => {
      const box = boxes[index] || { name: `Box ${index + 1}` };

      // Create a new Date object for the next occurrence of the specified time
      const now = new Date();
      const triggerDate = new Date(now);
      triggerDate.setHours(time.hour, time.minute, 0, 0);

      // If the time has already passed today, schedule it for tomorrow
      if (triggerDate < now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder for ${box.name}`,
          body: `Time to check ${box.name} at ${time.displayTime}!`,
          data: { boxId: box._id || `hardcoded-${index}` },
        },
        trigger: {
          date: triggerDate,
          repeats: true, // Set to true for daily reminders; change to false for one-time
        },
      });

      console.log(`Scheduled ${box.name} for ${time.displayTime} with ID: ${notificationId}`);
      return notificationId;
    });

    await Promise.all(notificationPromises);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Currently scheduled notifications:', scheduled);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Logged out and cleared notifications');
      navigation.replace("Login");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.gradient}>
        {user && (
          <View style={styles.profileContainer}>
            <View>
              <Text style={styles.profileTitle}>Welcome, {user.name}!</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.scheduleButtonContainer}>
            <Text style={styles.scheduleButtonText}>Schedule</Text>
            <Image source={require("../assets/icons/bell.png")} style={styles.bellIcon} />
          </View>

          {state.boxes?.map((box) => (
            <TouchableOpacity
              key={box._id}
              style={styles.boxContainer}
              onPress={() => {
                selectBox(box._id);
                navigation.navigate('BoxDetailScreen');
              }}
            >
              <View style={styles.boxContent}>
                <Text style={styles.boxTitle}>{box.name}</Text>
                <View style={styles.timerContainer}>
                  <Image source={require("../assets/icons/clock.png")} style={styles.clockIcon} />
                  <View>
                    <Text style={styles.boxDescription}>{box.description || 'No description'}</Text>
                    <Text style={styles.boxTime}>{box.timeSlot || 'No time set'}</Text>
                  </View>
                </View>
                <Text style={styles.seeMore}>See more...</Text>
              </View>
              <Image source={require("../assets/images/Medicine-box.png")} style={styles.medicineBoxImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setShowChat(true)}>
          <Image source={require("../assets/icons/ai.png")} style={styles.aiIcon} />
        </TouchableOpacity>

        <ChatAssistantModal visible={showChat} onClose={() => setShowChat(false)} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2EBF2',
  },
  gradient: {
    flex: 1,
  },
  profileContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10,
    marginLeft: 10,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
  },
  profileEmail: {
    fontSize: 13,
    color: '#657C7E',
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#1FD3A6',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
  },
  scheduleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00796B',
    backgroundColor: 'rgba(30, 29, 29, 0.12)',
  },
  scheduleButtonText: {
    color: '#00796B',
    fontSize: 15,
    fontWeight: '700',
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  boxContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boxContent: {
    flex: 1,
  },
  medicineBoxImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "#00796B",
    borderRadius: 10,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#00796B",
  },
  boxDescription: {
    fontSize: 16,
    color: '#657C7E',
    marginBottom: 4,
    width:150
  },
  boxTime: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  seeMore: {
    backgroundColor: '#00796B',
    color: '#FFFFFF',
    borderRadius: 5,
    textAlign: 'center',
    padding: 5,
    fontSize: 14,
    marginTop: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 21,
    height: 21,
    marginRight: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#00796B',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 100,
  },
  aiIcon: {
    width: 32,
    height: 29,
  },
});

export default BoxesScreen;