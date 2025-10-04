import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import api from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const fetchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Limpiar debounce previo
    if (fetchTimeoutRef.current) {
      window.clearTimeout(fetchTimeoutRef.current);
    }

    const scheduleFetch = () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      fetchTimeoutRef.current = window.setTimeout(async () => {
        try {
          const response = await api.get('/api/users/profile/');
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }, 150); // pequeño debounce para evitar ráfagas
    };

    setIsLoading(true);
    scheduleFetch();

    return () => {
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/users/login/', {
        username,
        password,
      });
      
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Error de autenticación');
      }
      throw new Error('Error de conexión');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Método específico para limpiar sesión expirada sin bucles
  const clearExpiredSession = () => {
    setUser(null);
    localStorage.removeItem('token');
    // No llamamos setToken aquí para evitar bucles del useEffect
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
