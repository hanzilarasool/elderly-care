import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const IP_ADDRESS = Constants.expoConfig.extra.IP_ADDRESS;

const Signup = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    specialization: "", // Optional field for doctors
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP array
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const otpRefs = useRef([]); // Refs for OTP input focus

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: prev.role === selectedRole ? "" : selectedRole }));
  };

  const handleSignup = async () => {
    try {
      setError("");
      setSuccess("");

      const { name, email, password, role } = formData;

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

      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/user/register`, formData);

      setSuccess(response.data.message);
      setStep(2); // Move to OTP verification
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || "Registration failed. Please try again.");
    }
  };

  const handleOTPChange = (value, index) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOTPSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      const otpValue = otp.join("");
      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/user/verify-otp`, {
        ...formData,
        otp: otpValue,
      });

      setSuccess(response.data.message);
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || "OTP verification failed. Please try again.");
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  return (
 
  
<LinearGradient
  colors={['white', '#F5F5F5']} // Whitish grey gradient colors
  start={{ x: 0.48, y: 0 }}
  end={{ x: 0.99, y: 0.41 }}
  style={styles.container}
>
      <View style={styles.signupSection}>
        <View style={{ alignItems: "center", marginBottom: 20, marginTop: 10,width:"56",height:"56",display:"flex",justifyContent:"center",marginLeft:"auto",marginRight:"auto" }}>
          <Image source={require("../assets/icons/profile.png")} style={{width:54,height:54}} />
        </View>
        <Text style={styles.title}>
          {step === 1 ? "Welcome to Elderly Care" : "Verify OTP"}
        </Text>

        {step === 1 ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              autoCapitalize="words"
              placeholderTextColor="#676054"
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#676054"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
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
                  color="#bbb7b0" // Match input text color
                />
              </TouchableOpacity>
            </View>

            {formData.role === "doctor" && (
              <TextInput
                style={styles.input}
                placeholder="Specialization (Optional)"
                value={formData.specialization}
                onChangeText={(text) => handleChange("specialization", text)}
                placeholderTextColor="#676054"
              />
            )}

            <Text style={styles.roleLabel}>Select Your Role:</Text>

            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleRoleSelection('doctor')}
              >
                <View style={[styles.checkbox, formData.role === 'doctor' && styles.checkedBox]}>
                  {formData.role === 'doctor' && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleRoleSelection('patient')}
              >
                <View style={[styles.checkbox, formData.role === 'patient' && styles.checkedBox]}>
                  {formData.role === 'patient' && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Patient</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleOTPKeyDown(e, index)}
                  maxLength={1}
                  keyboardType="numeric"
                  ref={(el) => (otpRefs.current[index] = el)}
                  textAlign="center"
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleOTPSubmit}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

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
    backgroundColor: "rgba(0,0,0,0.45)",
    // backgroundColor:"rgba(200, 200, 222,0.8)",
    borderTopRightRadius:15,
    padding: 14,
    // shadowColor: "#F00",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.8,
    // shadowRadius: 4,
    // elevation: 5,
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
    width:"100%",
    backgroundColor: "white",
    borderRadius: 10,

    marginBottom: 15,
    // elevation: 2,
  },
  passwordInput: {
    flex: 1,
    backgroundColor:"white",
    color: "black",
    border:"none",
    outline:"none",
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius:10,
  },
  eyeIcon: {
    padding: 10,
  },
  roleLabel: {
    fontSize: 16,
    color: "white",
    marginBottom: 12,
    marginTop: 10,
  },
  roleContainer: {
    flexDirection: 'row',
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
    color: 'white',
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    backgroundColor: "#333333",
    color: "#bbb7b0",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#666",
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
  loginText: {
    textAlign: "center",
    marginTop: 25,
    color: "white",
  },
  loginLink: {
    color: "#D3D3D3",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Signup;