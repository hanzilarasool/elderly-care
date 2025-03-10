// screens/Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';

const Login = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const users = route.params?.users || []; // Get users from navigation params

  const handleLogin = () => {
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      navigation.navigate('Dashboard', { user });
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate('Signup', { users })}>
        <Text style={styles.signupLink}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Reuse the same styles from Signup.js
const styles = {
  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  signupLink: {
    textAlign: 'center',
    marginTop: 10,
    color: 'blue',
  },
};

export default Login;