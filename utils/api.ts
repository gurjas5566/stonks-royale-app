import axios from "axios";
import { storage } from "./storage";
import { router } from "expo-router";

// Use dynamic env variable. Fallback to localhost if missing.
// Add `/api` since the backend routes are mounted there.
export const API_URL = process.env.EXPO_PUBLIC_API_URL 
  ? `${process.env.EXPO_PUBLIC_API_URL}/api` 
  : "http://192.168.1.11:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests and attach secure token if it exists
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error fetching token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle Token Expiry globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the server explicitly rejects the auth token
    if (error.response && error.response.status === 401) {
      console.warn("Session Expired or Invalid Token. Forcing logout.");
      
      // Wipe the stored identity natively
      await storage.removeItem("userToken");
      await storage.removeItem("userId");
      
      // Navigate seamlessly to the login page
      router.replace("/");
    }
    return Promise.reject(error);
  }
);

export default api;
