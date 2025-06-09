import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/investidor/DashboardScreen';
import PortfolioScreen from '../screens/investidor/PortfolioScreen';
import AprendaScreen from '../screens/investidor/AprendaScreen';
import PerfilScreen from '../screens/investidor/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function InvestorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Portfolio') iconName = 'pie-chart-outline';
          else if (route.name === 'Learn') iconName = 'book-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Learn" component={AprendaScreen} />
      <Tab.Screen name="Profile" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
