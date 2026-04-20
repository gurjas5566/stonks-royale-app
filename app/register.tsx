import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../utils/api";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { username, password });
      
      if (response.data) {
        Alert.alert("Success", "Account created successfully! You can now log in.");
        router.back();
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Join the Market</Text>
        <Text style={styles.subtitle}>Start building your empire today</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Choose a Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Create a Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d", 
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0a0",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    color: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: { 
    backgroundColor: "#00ff88", 
    padding: 18, 
    borderRadius: 12,
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: "#000", 
    textAlign: "center", 
    fontWeight: "800",
    fontSize: 18,
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#aaa",
    fontSize: 14,
  },
  loginTextBold: {
    color: "#00ff88",
    fontWeight: "700",
  }
});
