import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // certifique-se que o caminho está correto

export default function DashboardScreen() {
  const { logout } = useAuth();

  const recomendacoes = [
    'Oi, Você é um Investidor.'
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Boas Práticas em Casos de Falta de Energia</Text>

      <View style={styles.card}>
        {recomendacoes.map((item, idx) => (
          <Text key={idx} style={styles.item}>{item}</Text>
        ))}
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    width: '80%'
  },
  item: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
