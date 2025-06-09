import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { logout, userName } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Sair</Text>
          </TouchableOpacity>
        ),
      });
    });

    return unsubscribe;
  }, [navigation]);

  const cards = [
    {
      title: 'Atualizações de Mercado',
      desc: 'Receba boletins semanais com as principais tendências.',
      button: 'Ler Agora',
      route: 'Atualizacoes',
    },
    {
      title: 'Teste de Perfil',
      desc: 'Descubra seu perfil de investidor e receba recomendações.',
      button: 'Iniciar Teste',
      route: 'PerfilInvestidor',
    },
    {
      title: 'Investimentos',
      desc: 'Explore opções de fundos com explicações simples.',
      button: 'Ver Fundos',
      route: 'Fundos',
    },
    {
      title: 'Assistente com IA',
      desc: 'Receba suporte inteligente para decisões de investimento.',
      button: 'Conversar Agora',
      route: 'IA',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Olá, {userName || 'Investidor'}</Text>
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
              style={styles.button}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.buttonText}>{item.button}</Text>
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
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
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
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    maxWidth: 180,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logout: {
    color: '#007AFF',
    fontWeight: 'bold',
  }
});
