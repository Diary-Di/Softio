import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/api';
import * as storage from '../utils/storage';

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (tok: string, u: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (fields: { email?: string; password?: string }) => Promise<void>;
  loading: boolean;
};
const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([storage.getItem('token'), storage.getItem('user')]);
        if (t) setToken(t);
        if (u) {
          try {
            const parsed = JSON.parse(u);
            setUser(parsed);
          } catch {
            await storage.deleteItem('user');
          }
        }
      } catch (e) {
        console.warn('Erreur restauration auth', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (tok: string, u: User) => {
    setLoading(true);
    try {
      await storage.setItem('token', tok);
      await storage.setItem('user', JSON.stringify(u));
      setToken(tok);
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await Promise.all([storage.deleteItem('token'), storage.deleteItem('user')]);
    setToken(null);
    setUser(null);
  };

  const updateUser = async ({ email, password }: { email?: string; password?: string }) => {
    const updated: Partial<User> = { ...(user || {}) };
    if (email) updated.email = email;
    setUser(updated as User);
    await storage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);