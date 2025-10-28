// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend-api.com/api", // 🔁 change this to your API
});

export const setAuthToken = (token: string) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

export const loginUser = (credentials: { email: string; password: string }) => {
  return api.post("/login", credentials);
};

export default api;
