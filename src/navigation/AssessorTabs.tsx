import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/assessor/HomeScreen';
import PortfolioScreen from '../screens/assessor/PortfolioScreen';
import ClientesScreen from '../screens/assessor/ClientesScreen';
import InsightsScreen from '../screens/assessor/InsightsScreen';
import PerfilScreen from '../screens/assessor/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function AssessorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'portfólio') iconName = 'stats-chart-outline';
          else if (route.name === 'Clientes') iconName = 'people-outline';
          else if (route.name === 'Insights') iconName = 'analytics-outline';
          else if (route.name === 'Perfil') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="portfólio" component={PortfolioScreen} />
      <Tab.Screen name="Clientes" component={ClientesScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
