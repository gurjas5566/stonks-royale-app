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
import { storage } from "../utils/storage";
import api from "../utils/api";

export default function Index() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      
      const { token, user } = response.data;
      if (token) {
        await storage.setItem("userToken", token);
        await storage.setItem("userId", user._id);
        router.replace("/(tabs)/dashboard");
      } else {
        Alert.alert("Error", "No token received from server.");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message || "Make sure the backend server is running.";
      Alert.alert("Login Failed", message);
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
        <Text style={styles.title}>Stonks Royale</Text>
        <Text style={styles.subtitle}>Welcome back to the market</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Connecting..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerLink}>
          <Text style={styles.registerText}>
            New to Stonks? <Text style={styles.registerTextBold}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d", // Dark mode aesthetic
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 42,
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
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    color: "#aaa",
    fontSize: 14,
  },
  registerTextBold: {
    color: "#00ff88",
    fontWeight: "700",
  }
});
