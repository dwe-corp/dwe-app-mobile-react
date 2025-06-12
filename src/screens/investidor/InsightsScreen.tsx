import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function InsightsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Panorama do Mercado</Text>

        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Boletim Semanal</Text>
            <Text style={styles.cardDescription}>
              Mantenha-se à frente com análises especializadas sobre tendências e oportunidades do mercado.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('AtualizacoesInvestidor')}
            >
              <Text style={styles.buttonText}>Leia Agora</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/news.png')}
            style={styles.cardImage}
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Indicadores de Performance</Text>

        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Portfólio</Text>
            <Text style={styles.cardDescription}>
              Acesse relatórios detalhados de desempenho, incluindo alocação de ativos e retornos.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('PortfolioInvestidor')}
            >
              <Text style={styles.buttonText}>Ver Relatórios</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/chart.png')}
            style={styles.cardImage}
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Ferramentas</Text>

        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Simulador de Portfólio</Text>
            <Text style={styles.cardDescription}>
              Experimente diferentes estratégias de investimento e simule o desempenho da carteira.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('SimuladorInvestidor')}
            >
              <Text style={styles.buttonText}>Simular</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/simulator.png')}
            style={styles.cardImage}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.cardRow}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Lembretes Inteligentes</Text>
            <Text style={styles.cardDescription}>
              Configure lembretes automáticos para revisões de carteira e datas importantes.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('LembretesInvestidor')}
            >
              <Text style={styles.buttonText}>Criar Lembretes</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/reminder.png')}
            style={styles.cardImage}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('IA')}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
    width: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});
