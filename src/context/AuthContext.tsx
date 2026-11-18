import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { saveSession, getSession, clearSession } from '../utils/tokenStorage';

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  loadingAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    first_name: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    getSession().then((session) => {
      if (session.token && session.username) {
        setToken(session.token);
        setUsername(session.username);
      }
      setLoadingAuth(false);
    });
  }, []);

  const login = async (user: string, password: string) => {
    const response = await api.post('/token/', {
      username: user.trim(),
      password,
    });
    const accessToken = response.data.access;
    await saveSession(accessToken, user.trim());
    setToken(accessToken);
    setUsername(user.trim());
  };

  const register = async (data: {
    username: string;
    email: string;
    first_name: string;
    password: string;
  }) => {
    await api.post('/registro/', {
      username: data.username.trim(),
      email: data.email.trim(),
      first_name: data.first_name.trim(),
      password: data.password,
    });
    // Inicia sesión automáticamente tras crear la cuenta
    await login(data.username, data.password);
  };

  const logout = async () => {
    await clearSession();
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        loadingAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}