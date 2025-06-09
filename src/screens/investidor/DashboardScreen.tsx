import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }) {
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
      <Text style={styles.header}>Olá, Investidor</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atualizações de Mercado</Text>
        <Text style={styles.sectionDesc}>
          Fique por dentro das últimas tendências e oportunidades com nosso boletim semanal.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ler Agora</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teste de Perfil de Investidor</Text>
        <Text style={styles.sectionDesc}>
          Descubra seu estilo de investimento e receba recomendações personalizadas.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Iniciar Teste</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opções de Investimento</Text>
        <Text style={styles.sectionDesc}>
          Explore fundos acessíveis e com explicações simples para novos investidores.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver Fundos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suporte com IA</Text>
        <Text style={styles.sectionDesc}>
          Receba recomendações de investimento com a ajuda da nossa assistente inteligente.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Conversar Agora</Text>
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
