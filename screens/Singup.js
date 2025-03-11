import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

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

  const handleRoleSelection = (selectedRole) => {
    setRole(prevRole => prevRole === selectedRole ? "" : selectedRole);
  };

  const handleSignup = async () => {
    try {
      setError("");
      setSuccess("");

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

      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/user/register`, {
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
      <View style={styles.signupSection}>
        <View style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}>
          <Image source={require("../assets/icons/profile.png")} />
        </View>
        <Text style={styles.title}>Welcome to Elderly Care</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor="#676054"
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#676054"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor="#676054"
        />

        <Text style={styles.roleLabel}>Select Your Role:</Text>

        <View style={styles.roleContainer}>
          {/* Healthcare Provider Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleRoleSelection('doctor')}
          >
            <View style={[styles.checkbox, role === 'doctor' && styles.checkedBox]}>
              {role === 'doctor' && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Doctor</Text>
          </TouchableOpacity>

          {/* Patient Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleRoleSelection('patient')}
          >
            <View style={[styles.checkbox, role === 'patient' && styles.checkedBox]}>
              {role === 'patient' && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Patient</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginLink} onPress={handleLoginRedirect}>
            Login
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
  signupSection: {
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
  roleLabel: {
    fontSize: 16,
    color: "#6d7781",
    marginBottom: 12,
    marginTop: 10,
  },
  roleContainer: {
    flexDirection: 'row', // Add this line to make checkboxes in one row
    gap: 40,
    marginLeft: 7,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#333',
  },
  checkedBox: {
    backgroundColor: '#5D65B0',
    borderColor: '#5D65B0',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#bbb7b0',
    fontSize: 16,
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
  loginText: {
    textAlign: "center",
    marginTop: 25,
    color: "#6C757D",
  },
  loginLink: {
    color: "#F00",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Signup;