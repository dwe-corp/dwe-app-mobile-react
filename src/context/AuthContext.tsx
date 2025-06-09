
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, logoutUser } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: 'INVESTIDOR' | 'ASSESSOR' | null;
  login: (profile: 'INVESTIDOR' | 'ASSESSOR') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userProfile: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<'INVESTIDOR' | 'ASSESSOR' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = await AsyncStorage.getItem('token');
      const profile = await AsyncStorage.getItem('profile');
      setIsAuthenticated(!!token);
      if (profile === 'INVESTIDOR' || profile === 'ASSESSOR') {
        setUserProfile(profile);
      }
    };
    loadData();
  }, []);

  const login = async (profile: 'INVESTIDOR' | 'ASSESSOR') => {
    await AsyncStorage.setItem('profile', profile);
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('profile');
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
