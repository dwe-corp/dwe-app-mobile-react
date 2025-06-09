import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { logout, userName } = useAuth();
  const navigation = useNavigation(); // <-- necessário para navegação funcionar

  const cards = [
    {
      title: 'Relatórios de Clientes',
      desc: 'Acesse relatórios completos dos portfólios dos seus clientes, incluindo performance, alocação e risco.',
      button: 'Ver Relatórios',
      route: 'Relatorios'
    },
    {
      title: 'Ferramentas de Simulação',
      desc: 'Simule diferentes carteiras para mostrar aos seus clientes os possíveis cenários de retorno.',
      button: 'Simular Carteira',
      route: 'Simulador'
    },
    {
      title: 'Lembretes Inteligentes',
      desc: 'Programe lembretes para reuniões, revisões de carteira e datas importantes.',
      button: 'Verificar Lembretes',
      route: 'Lembretes'
    },
    {
      title: 'Suporte ao Cliente',
      desc: 'Acompanhe o atendimento e envie mensagens personalizadas para seus clientes.',
      button: 'Abrir Chat',
      route: 'Chat'
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Olá, {userName || 'Assessor'}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {cards.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.cardButtonText}>{item.button}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const CARD_GAP = 16;

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  logout: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: CARD_GAP,
    marginRight: CARD_GAP / 2,
    marginLeft: CARD_GAP / 2,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 220,
  },
  cardButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    maxWidth: 180,
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  }
});
