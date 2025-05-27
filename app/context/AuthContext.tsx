import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_image?: string | null;
  phone?: string | null;
  subscription_status?: boolean;
  last_subscription_date?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'auth_user';
const STORAGE_KEY_TOKEN = 'auth_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Load stored auth state on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      
      if (storedUser && storedToken) {
        setUserState(JSON.parse(storedUser));
        setTokenState(storedToken);
      }
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (Platform.OS === 'web') {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (Platform.OS === 'web') {
      if (newToken) {
        localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};