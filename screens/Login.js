import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

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
        password
      });

      setSuccess("Login successful!");
      setTimeout(() => navigation.navigate("Profile"), 1500);
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
    <LinearGradient
      colors={['#201919', '#810202']}
      start={{ x: 0.48, y: 0 }}
      end={{ x: 0.99, y: 0.41 }}
      style={styles.container}
    >
      <View style={styles.loginSection}>
        <View style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}>
          <Image source={require("../assets/icons/profile.png")}  />
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
            secureTextEntry={!showPassword} // Toggle based on showPassword
            autoCapitalize="none"
            placeholderTextColor="#676054"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#bbb7b0" // Match your input text color
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink} onPress={handleSignupRedirect}>
            Sign Up
          </Text>
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
    backgroundColor: "#222222",
    padding: 14,
    shadowColor: "#F00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
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
    backgroundColor: "#333333",
    color: "#bbb7b0",
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
    backgroundColor: "#333333",
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    color: "#bbb7b0",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#F00",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
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
    color: "#6C757D",
  },
  signupLink: {
    color: "#F00",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Login;