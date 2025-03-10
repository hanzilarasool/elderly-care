import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient'; // Add this import

const Signup = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignup = async () => {
    try {
      // Reset messages
      setError("");
      setSuccess("");

      // Frontend validation
      if (!name || !email || !password) {
        setError("All fields are required");
        return;
      }

      if (!role) {
        setError("Please select a role");
        return;
      }

      if (!isValidEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      const response = await axios.post(`http://192.168.1.4:5000/api/user/register`, {
        name,
        email,
        password,
        role
      });

      setSuccess(response.data.message);
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || "Registration failed. Please try again.");
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
  };

  return (
    <LinearGradient
    colors={['#201919', '#810202']}
    start={{ x: 0.48, y: 0 }}
    end={{ x: 0.99, y: 0.41 }}
    style={styles.container}
  >
    {/* Rest of your JSX content */}

     <View style={styles.signupSection}>
     <Text style={styles.title}>Welcome to Elderly Care</Text>

<TextInput
  style={styles.input}
  placeholder="Full Name"
  value={name}
  onChangeText={setName}
  autoCapitalize="words"
/>

<TextInput
  style={styles.input}
  placeholder="Email Address"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>

<TextInput
  style={styles.input}
  placeholder="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  autoCapitalize="none"
/>

<Text style={styles.roleLabel}>Select Your Role:</Text>

<View style={styles.roleContainer}>
  <TouchableOpacity
    style={[styles.roleButton, role === 'doctor' && styles.selectedRole]}
    onPress={() => setRole('doctor')}
  >
    <Text style={[styles.roleText, role === 'doctor' && styles.selectedRoleText]}>
      Healthcare Provider
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.roleButton, role === 'patient' && styles.selectedRole]}
    onPress={() => setRole('patient')}
  >
    <Text style={[styles.roleText, role === 'patient' && styles.selectedRoleText]}>
      Patient/Care Recipient
    </Text>
  </TouchableOpacity>
</View>

{error ? <Text style={styles.error}>{error}</Text> : null}
{success ? <Text style={styles.success}>{success}</Text> : null}

<TouchableOpacity style={styles.button} onPress={handleSignup}>
  <Text style={styles.buttonText}>Create Account</Text>
</TouchableOpacity>

<Text style={styles.loginText}>
  Already have an account?{" "}
  <Text style={styles.loginLink} onPress={handleLoginRedirect}>
    Sign In
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
   
    // background: linear-gradient(91deg, #201919 0.48%, #810202 99.41%);
  },
  signupSection:{
    borderRadius: 5,
    width: "100%",
    backgroundColor: "#222222",
    padding:14,
    shadowColor: "#F00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    
   
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#333333",
    color: "#676054",
    // borderWidth: 1,
    // borderColor: "#DEE2E6",
    borderRadius: 8,
    paddingHorizontal: 15,
    outlineColor: "#333333",
    outlineWidth: 0,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  roleLabel: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 12,
    marginTop: 10,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#E9ECEF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
  },
  selectedRole: {
    backgroundColor: "#5D65B0",
    borderColor: "#5D65B0",
  },
  roleText: {
    textAlign: "center",
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  selectedRoleText: {
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#5D65B0",
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
  loginText: {
    textAlign: "center",
    marginTop: 25,
    color: "#6C757D",
  },
  loginLink: {
    color: "#5D65B0",
    fontWeight: "600",
  },
});

export default Signup;