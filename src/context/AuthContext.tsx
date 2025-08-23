import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Perfil = 'INVESTIDOR' | 'ASSESSOR';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: Perfil | null;
  userName: string | null;
  userEmail: string | null;
  login: (profile: Perfil, nome: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userProfile: null,
  userName: null,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<Perfil | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [[, token], [, profile], [, nome], [, email]] = await AsyncStorage.multiGet(
        ['token', 'profile', 'nome', 'email']
      );

      // Mantém a regra atual baseada em token (já que salvamos o token no loginUser)
      setIsAuthenticated(!!token);

      if (profile === 'INVESTIDOR' || profile === 'ASSESSOR') {
        setUserProfile(profile as Perfil);
      } else {
        setUserProfile(null);
      }

      setUserName(nome ?? null);
      setUserEmail(email ?? null);

      setLoading(false);
    };

    loadData();
  }, []);

  const login = async (profile: Perfil, nome: string, email: string) => {
    await AsyncStorage.multiSet([
      ['profile', profile],
      ['nome', nome ?? ''],
      ['email', email ?? ''],
    ]);

    setUserProfile(profile);
    setUserName(nome ?? '');
    setUserEmail(email ?? '');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'profile', 'nome', 'email']);
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
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);