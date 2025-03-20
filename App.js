// frontend/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Signup from './screens/Singup'; 
import Login from './screens/Login';
import DoctorProfile from './screens/DoctorProfile';
import PatientProfile from './screens/PatientProfile';
import AdminDashboard from './screens/AdminDashboard';
import PatientDetails from './screens/PatientDetails';
import EditPatient from './screens/EditPatient'; // New screen
import Reports from './screens/Reports'; // Placeholder
import Alerts from './screens/Alerts'; // Placeholder
import PatientManagement from './screens/PatientManagement'; // New screen

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DoctorDrawer = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerStyle: { backgroundColor: '#201919', width: 240 },
      drawerLabelStyle: { color: '#fff', fontSize: 16 },
      drawerActiveTintColor: '#00796B',
    }}
  >
    <Drawer.Screen name="Profile" component={DoctorProfile} />
    <Drawer.Screen name="Reports" component={Reports} />
    <Drawer.Screen name="Alerts" component={Alerts} />
  </Drawer.Navigator>
);

export default function App() {
  return (
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
            headerLeft: () => (
              <Ionicons name="menu" size={24} color="#fff" style={{ marginLeft: 15 }} onPress={() => navigation.toggleDrawer()} />
            ),
          })}
        />
        <Stack.Screen name="PatientProfile" component={PatientProfile} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="PatientManagement" component={PatientManagement}/>
        <Stack.Screen name="PatientDetails" component={PatientDetails} />
        <Stack.Screen name="EditPatient" component={EditPatient} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}