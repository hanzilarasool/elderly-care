// // import { StatusBar } from 'expo-status-bar';
// // import { StyleSheet, Text, View,TouchableOpacity } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';

// // import Constants from 'expo-constants';

// // // App.js
// // import React from 'react';
// // import { NavigationContainer } from '@react-navigation/native';
// // import { createStackNavigator } from '@react-navigation/stack';
// // import Signup from './screens/Singup';
// // import Login from './screens/Login';
// // import ProfileScreen from './screens/ProfileScreen';
// // export default function App() {
// //   const Stack = createStackNavigator();

// //   const API_URL = Constants.expoConfig.extra.API_URL;
// // const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;

// // console.log(API_URL);
// // console.log(GOOGLE_MAPS_API_KEY);
// //   return (
// //     <NavigationContainer>
// //     <Stack.Navigator
// //         screenOptions={{
// //           headerStyle: {
// //             backgroundColor: '#201919',
// //             elevation: 0,
// //             shadowOpacity: 0,
// //           },
// //           headerTintColor: '#fff',
// //           headerTitleStyle: {
// //             fontSize: 18,
// //             fontWeight: '600',
// //           },
// //           headerBackImage: () => (
// //             <Ionicons 
// //               name="arrow-back" 
// //               size={24} 
// //               color="#fff" 
// //               style={{ marginLeft: 15 }}
// //             />
// //           ),
// //           headerBackTitleVisible: false
// //         }}
// //       >
// //         <Stack.Screen name="Signup" component={Signup} />
// //         <Stack.Screen name="Login" component={Login} />
// //         <Stack.Screen name="Profile" component={ProfileScreen} />
        

// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });

// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Ionicons } from '@expo/vector-icons';
// import Signup from './screens/Signup';
// import Login from './screens/Login';
// import DoctorProfile from './screens/DoctorProfile';
// import PatientProfile from './screens/PatientProfile';
// import AdminDashboard from './screens/AdminDashboard';
// import Reports from './screens/Reports'; // Placeholder
// import Alerts from './screens/Alerts'; // Placeholder

// const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();

// const DoctorDrawer = () => (
//   <Drawer.Navigator>
//     <Drawer.Screen name="Profile" component={DoctorProfile} />
//     <Drawer.Screen name="Reports" component={Reports} />
//     <Drawer.Screen name="Alerts" component={Alerts} />
//   </Drawer.Navigator>
// );

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{
//           headerStyle: { backgroundColor: '#201919', elevation: 0, shadowOpacity: 0 },
//           headerTintColor: '#fff',
//           headerTitleStyle: { fontSize: 18, fontWeight: '600' },
//           headerBackImage: () => <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginLeft: 15 }} />,
//           headerBackTitleVisible: false,
//         }}
//       >
//         <Stack.Screen name="Signup" component={Signup} />
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen
//           name="DoctorProfile"
//           component={DoctorDrawer}
//           options={({ navigation }) => ({
//             headerLeft: () => (
//               <Ionicons name="menu" size={24} color="#fff" style={{ marginLeft: 15 }} onPress={() => navigation.toggleDrawer()} />
//             ),
//           })}
//         />
//         <Stack.Screen name="PatientProfile" component={PatientProfile} />
//         <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// App.jsx
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
import Reports from './screens/Reports'; // Placeholder
import Alerts from './screens/Alerts'; // Placeholder

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DoctorDrawer = () => (
  <Drawer.Navigator>
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
        <Stack.Screen name="PatientDetails" component={PatientDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
