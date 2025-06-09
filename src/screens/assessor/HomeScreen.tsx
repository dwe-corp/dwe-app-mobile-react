import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { logout } = useAuth();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Bem-vindo, Assessor</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relatórios de Clientes</Text>
        <Text style={styles.sectionDesc}>
          Acesse relatórios completos dos portfólios dos seus clientes, incluindo performance, alocação e risco.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver Relatórios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ferramentas de Simulação</Text>
        <Text style={styles.sectionDesc}>
          Simule diferentes carteiras para mostrar aos seus clientes os possíveis cenários de retorno.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Simular Carteira</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lembretes Inteligentes</Text>
        <Text style={styles.sectionDesc}>
          Programe lembretes para reuniões, revisões de carteira e datas importantes.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Configurar Lembretes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    flexGrow: 1
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222'
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});
