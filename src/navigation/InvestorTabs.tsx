import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/investidor/DashboardScreen';
import PortfolioScreen from '../screens/investidor/PortfolioScreen';
import AprendaScreen from '../screens/investidor/AprendaScreen';
import PerfilScreen from '../screens/investidor/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function InvestorTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Learn" component={AprendaScreen} />
      <Tab.Screen name="Profile" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
