import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/investidor/DashboardScreen';
import PortfolioScreen from '../screens/investidor/PortfolioScreen';
import InsightsScreen from '../screens/investidor/InsightsScreen';
import PerfilScreen from '../screens/investidor/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function InvestorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'portfólio') iconName = 'stats-chart-outline';
          else if (route.name === 'Insights') iconName = 'analytics-outline';
          else if (route.name === 'Perfil') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="portfólio" component={PortfolioScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
