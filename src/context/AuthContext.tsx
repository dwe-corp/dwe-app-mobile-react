import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: 'INVESTIDOR' | 'ASSESSOR' | null;
  userName: string | null;
  userEmail: string | null;
  login: (profile: 'INVESTIDOR' | 'ASSESSOR', nome: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userProfile: null,
  userName: null,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<'INVESTIDOR' | 'ASSESSOR' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = await AsyncStorage.getItem('token');
      const profile = await AsyncStorage.getItem('profile');
      const nome = await AsyncStorage.getItem('nome');
      const email = await AsyncStorage.getItem('email');

      setIsAuthenticated(!!token);

      if (profile === 'INVESTIDOR' || profile === 'ASSESSOR') {
        setUserProfile(profile);
      }

      if (nome) setUserName(nome);
      if (email) setUserEmail(email);
    };

    loadData();
  }, []);

  const login = async (profile: 'INVESTIDOR' | 'ASSESSOR', nome: string, email: string) => {
    await AsyncStorage.setItem('profile', profile);
    await AsyncStorage.setItem('nome', nome);
    await AsyncStorage.setItem('email', email);
    setUserProfile(profile);
    setUserName(nome);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('profile');
    await AsyncStorage.removeItem('nome');
    await AsyncStorage.removeItem('email');
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserName(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        userName,
        userEmail,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
