import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import InvestorTabs from './src/navigation/InvestorTabs';
import AssessorTabs from './src/navigation/AssessorTabs';

import SimuladorAssessorScreen from './src/screens/assessor/funcionalidades/SimuladorAssessorScreen';
import ChatScreen from './src/screens/assessor/funcionalidades/ChatScreen';
import LembretesAssessorScreen from './src/screens/assessor/funcionalidades/LembretesAssessorScreen';
import RelatoriosScreen from './src/screens/assessor/funcionalidades/RelatoriosScreen';


import PerfilInvestidorScreen from './src/screens/investidor/funcionalidades/PerfilInvestidorScreen';
import FundosScreen from './src/screens/investidor/funcionalidades/FundosScreen';
import IAScreen from './src/screens/investidor/funcionalidades/IAScreen';
import AtualizacoesInvestidorScreen from './src/screens/investidor/funcionalidades/AtualizacoesInvestidorScreen';
import PortfolioInvestidorScreen from './src/screens/investidor/funcionalidades/PortfolioInvestidorScreen';
import SimuladorInvestidorScreen from './src/screens/investidor/funcionalidades/SimuladorInvestidorScreen';
import LembretesInvestidorScreen from './src/screens/investidor/funcionalidades/LembretesInvestidorScreen';
import ConfiguracoesInvestidorScreen from './src/screens/investidor/funcionalidades/ConfiguracoesInvestidorScreen';
import FormularioInvestidorScreen from './src/screens/investidor/funcionalidades/FormularioInvestidorScreen';

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
          <Stack.Screen name="SimuladorAssessor" component={SimuladorAssessorScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="LembretesAssessor" component={LembretesAssessorScreen} />
          <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
          
          {/* Telas extras do Investidor acessadas por botão */}
          <Stack.Screen name="PerfilInvestidor" component={PerfilInvestidorScreen} />
          <Stack.Screen name="Fundos" component={FundosScreen} />
          <Stack.Screen name="IA" component={IAScreen} />
          <Stack.Screen name="AtualizacoesInvestidor" component={AtualizacoesInvestidorScreen} />
          <Stack.Screen name="PortfolioInvestidor" component={PortfolioInvestidorScreen} />
          <Stack.Screen name="SimuladorInvestidor" component={SimuladorInvestidorScreen} />
          <Stack.Screen name="LembretesInvestidor" component={LembretesInvestidorScreen} />
          <Stack.Screen name="ConfiguracoesInvestidor" component={ConfiguracoesInvestidorScreen} />
          <Stack.Screen name="FormularioInvestidor" component={FormularioInvestidorScreen} />

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
