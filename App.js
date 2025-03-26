// frontend/App.js
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Signup from './screens/Singup'; // Fixed typo: "Singup" → "Signup"
import Login from './screens/Login';
import DoctorProfile from './screens/DoctorProfile';
import PatientProfile from './screens/PatientProfile';
import AdminDashboard from './screens/AdminDashboard';
import PatientDetails from './screens/PatientDetails';
import EditPatient from './screens/EditPatient';
import Reports from './screens/Reports';
import Alerts from './screens/Alerts';
import PatientManagement from './screens/PatientManagement';
import Precautions from './screens/Precautions';
import PrecautionDetails from './screens/PrecautionDetails';
import EmergencyProtocols from './screens/EmergencyProtocols';
import EmergencyDetails from './screens/EmergencyDetails';
import PatientAwareness from './screens/PatientAwareness';
import BoxesScreen from './screens/BoxesScreen';
import BoxDetailScreen from "./screens/BoxDetailScreen"
import AwarenessDetails from './screens/AwarenessDetails';
import { BoxesProvider } from './contexts/BoxesContext';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DoctorDrawer = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerStyle: { backgroundColor: '#201919', width: 240 },
      drawerLabelStyle: { color: '#fff', fontSize: 16 },
      drawerActiveTintColor: '#00796B',
      headerStyle: { backgroundColor: '#201919', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Drawer.Screen name="DoctorProfile" component={DoctorProfile} />
    <Drawer.Screen name="Precautions" component={Precautions} />
    <Drawer.Screen name="Emergency Protocols" component={EmergencyProtocols} />
  </Drawer.Navigator>
);

const PatientDrawer = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerStyle: { backgroundColor: '#201919', width: 240 },
      drawerLabelStyle: { color: '#fff', fontSize: 16 },
      drawerActiveTintColor: '#00796B',
      headerStyle: { backgroundColor: '#201919', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Drawer.Screen name="PatientProfile" component={PatientProfile} />
    <Drawer.Screen name="Medicines" component={BoxesScreen} /> 
    <Drawer.Screen name="PatientAwareness" component={PatientAwareness} />
  </Drawer.Navigator>
);

export default function App() {
  return (
    <BoxesProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#201919', elevation: 0, shadowOpacity: 0 },
            headerTintColor: '#fff',
            headerTitleStyle: { fontSize: 18, fontWeight: '600' },
            headerBackImage: () => <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginLeft: 15 }} />,
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="DoctorProfile"
            component={DoctorDrawer}
            options={({ navigation }) => ({
              headerShown: false,
              headerLeft: () => (
                <Ionicons
                  name="menu"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 15 }}
                  onPress={() => navigation.toggleDrawer()}
                />
              ),
            })}
          />
          <Stack.Screen
            name="PatientProfile"
            component={PatientDrawer}
            options={({ navigation }) => ({
              headerShown: false,
              headerLeft: () => (
                <Ionicons
                  name="menu"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 15 }}
                  onPress={() => navigation.toggleDrawer()}
                />
              ),
            })}
          />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="PatientManagement" component={PatientManagement} />
          <Stack.Screen name="PatientDetails" component={PatientDetails} />
          <Stack.Screen name="EditPatient" component={EditPatient} />
          <Stack.Screen name="PrecautionDetails" component={PrecautionDetails} />
          <Stack.Screen name="EmergencyDetails" component={EmergencyDetails} />
          <Stack.Screen name="AwarenessDetails" component={AwarenessDetails} />
          <Stack.Screen name="BoxDetailScreen" component={BoxDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BoxesProvider>
  );
}