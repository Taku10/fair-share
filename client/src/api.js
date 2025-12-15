// client/src/api.js
import axios from "axios";
import { auth } from "./firebase";

const API_BASE = "http://localhost:5000/api";

// Helper to get token from current user
async function getAuthToken() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("No authenticated user found. User is not logged in.");
      return null;
    }
    const token = await user.getIdToken(true); // Force refresh
    console.log("Token obtained successfully");
    return token;
  } catch (error) {
    console.error("Failed to get auth token:", error.message);
    return null;
  }
}

export async function apiGet(path) {
  const token = await getAuthToken();

  return axios.get(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiPost(path, data) {
  const token = await getAuthToken();

  return axios.post(`${API_BASE}${path}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiPut(path, data) {
  const token = await getAuthToken();

  return axios.put(`${API_BASE}${path}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiDelete(path) {
  const token = await getAuthToken();

  return axios.delete(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
