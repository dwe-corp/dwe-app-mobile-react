import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AssessorTabs from './src/navigation/AssessorTabs';
import InvestorTabs from './src/navigation/InvestorTabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { isAuthenticated, userProfile } = useAuth();

  console.log('Perfil do usuário autenticado:', userProfile);

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userProfile === 'INVESTIDOR' ? (
        <Stack.Screen name="InvestorTabs" component={InvestorTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="AssessorTabs" component={AssessorTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default AppContent;
