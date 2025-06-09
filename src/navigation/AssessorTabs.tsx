import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/assessor/HomeScreen';
import ClientesScreen from '../screens/assessor/ClientesScreen';
import InvestimentosScreen from '../screens/assessor/InvestimentosScreen';
import ConfiguracoesScreen from '../screens/assessor/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();

export default function AssessorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Clientes') iconName = 'people-outline';
          else if (route.name === 'Investimentos') iconName = 'bar-chart-outline';
          else if (route.name === 'Configurações') iconName = 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Clientes" component={ClientesScreen} />
      <Tab.Screen name="Investimentos" component={InvestimentosScreen} />
      <Tab.Screen name="Configurações" component={ConfiguracoesScreen} />
    </Tab.Navigator>
  );
}
