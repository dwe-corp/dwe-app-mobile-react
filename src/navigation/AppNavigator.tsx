import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FormScreen from '../screens/FormScreen';
import DetailsScreen from '../screens/DetailsScreen';
import RecomendacoesScreen from '../screens/RecomendacoesScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Apagão Cidadão" component={HomeScreen} />
      <Stack.Screen name="Cadastrar Evento" component={FormScreen} />
      <Stack.Screen name="Informação" component={DetailsScreen} />
      <Stack.Screen name="Recomendação" component={RecomendacoesScreen} />
    </Stack.Navigator>
  );
}
