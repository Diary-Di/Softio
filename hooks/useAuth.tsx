import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { User } from "../types/api";
import * as storage from "../utils/storage";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: any;
  register: (data: any) => Promise<any>;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await storage.getItem("token");
        const savedUser = await storage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser) ?? null);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.log("Erreur lors du chargement de la session :", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const register = useCallback(async (userData: any) => {
    setError(null);
    return await authService.register(userData);
  }, []);

  const login = useCallback(async (credentials: any) => {
    setError(null);
    const response = await authService.login(credentials);

    if (response.success && response.token) {
      await storage.setItem("token", response.token);
      await storage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user ?? null);
    }

    return response;
  }, []);

  const logout = useCallback(async () => {
    await storage.deleteItem("token");
    await storage.deleteItem("user");

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
