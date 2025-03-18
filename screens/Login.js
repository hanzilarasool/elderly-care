import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import Constants from "expo-constants";

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;
console.log("ip addres login page",IP_ADDRESS)
const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    try {
      setError("");
      setSuccess("");

      if (!email || !password) {
        setError("All fields are required");
        return;
      }

      if (!isValidEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/user/login`, {
        email,
        password,
      });

      const { token, user } = response.data; // Get token and user data from response
      await AsyncStorage.setItem('token', token); // Store token
      await AsyncStorage.setItem('user', JSON.stringify(user)); // Store user data

      setSuccess("Login successful!");

      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'doctor') {
          navigation.navigate("DoctorProfile");
        } else if (user.role === 'patient') {
          navigation.navigate("PatientProfile");
        } else if (user.role === 'admin') {
          navigation.navigate("AdminDashboard");
        }
      }, 1500);
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || "Login failed. Please try again.");
    }
  };

  const handleSignupRedirect = () => {
    navigation.navigate("Signup");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LinearGradient colors={['white', '#F5F5F5']} start={{ x: 0.48, y: 0 }} end={{ x: 0.99, y: 0.41 }} style={styles.container}>
      <View style={styles.loginSection}>
        <View style={{ alignItems: "center", marginBottom: 20, marginTop: 10, width: "56", height: "56", display: "flex", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
          <Image source={require("../assets/icons/profile.png")} style={{ width: 54, height: 54 }} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#676054"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholderTextColor="#676054"
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#bbb7b0" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink} onPress={handleSignupRedirect}>Sign Up</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },
  loginSection: {
    borderRadius: 5,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderTopRightRadius: 15,
    padding: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "white",
    color: "#6e6e6d",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "white",
    color: "black",
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#DC3545",
    marginBottom: 15,
    textAlign: "center",
  },
  success: {
    color: "#28A745",
    marginBottom: 15,
    textAlign: "center",
  },
  signupText: {
    textAlign: "center",
    marginTop: 25,
    color: "white",
  },
  signupLink: {
    color: "#D3D3D3",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Login;