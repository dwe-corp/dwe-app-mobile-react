import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import InvestorTabs from './src/navigation/InvestorTabs';
import AssessorTabs from './src/navigation/AssessorTabs';

import SimuladorScreen from './src/screens/assessor/funcionalidades/SimuladorScreen';
import ChatScreen from './src/screens/assessor/funcionalidades/ChatScreen';
import LembretesScreen from './src/screens/assessor/funcionalidades/LembretesScreen';
import RelatoriosScreen from './src/screens/assessor/funcionalidades/RelatoriosScreen';

import AtualizacoesScreen from './src/screens/investidor/funcionalidades/AtualizacoesScreen';
import PerfilInvestidorScreen from './src/screens/investidor/funcionalidades/PerfilInvestidorScreen';
import FundosScreen from './src/screens/investidor/funcionalidades/FundosScreen';
import IAScreen from './src/screens/investidor/funcionalidades/IAScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { isAuthenticated, userProfile } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {userProfile === 'INVESTIDOR' ? (
            <Stack.Screen name="Main" component={InvestorTabs} />
          ) : (
            <Stack.Screen name="Main" component={AssessorTabs} />
          )}

          {/* Telas extras do Assessor acessadas por botão */}
          <Stack.Screen name="Simulador" component={SimuladorScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Lembretes" component={LembretesScreen} />
          <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
          
          {/* Telas extras do Investidor acessadas por botão */}
          <Stack.Screen name="Atualizacoes" component={AtualizacoesScreen} />
          <Stack.Screen name="PerfilInvestidor" component={PerfilInvestidorScreen} />
          <Stack.Screen name="Fundos" component={FundosScreen} />
          <Stack.Screen name="IA" component={IAScreen} />

        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </AuthProvider>
  );
}
