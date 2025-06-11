import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getUserRiskProfile } from '../../services/suitabilityService';

export default function DashboardScreen() {
  const { logout, userName, userEmail } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!userEmail) return;

      setLoading(true);
      const perfilRisco = await getUserRiskProfile(userEmail);
      setPerfil(perfilRisco);
      setLoading(false);
    };

    fetchPerfil();
  }, [userEmail, isFocused]);

  const getPerfilStyle = (perfil: string | undefined | null) => {
    switch (perfil?.toUpperCase()) {
      case 'CONSERVADOR':
        return {
          backgroundColor: '#E8F5E9',
          borderColor: '#A5D6A7',
          color: '#2E7D32',
        };
      case 'MODERADO':
        return {
          backgroundColor: '#FFF8E1',
          borderColor: '#FFE082',
          color: '#F57F17',
        };
      case 'AGRESSIVO':
        return {
          backgroundColor: '#FFEBEE',
          borderColor: '#EF9A9A',
          color: '#C62828',
        };
      default:
        return {
          backgroundColor: '#E6F0FF',
          borderColor: '#B0D4FF',
          color: '#007AFF',
        };
    }
  };

  const cards = [
    {
      title: 'Teste de Perfil',
      desc: 'Descubra seu perfil de investidor e receba recomendações.',
      button: 'Iniciar Teste',
      route: 'PerfilInvestidor',
    },
    {
      title: 'Atualizações de Mercado',
      desc: 'Receba boletins semanais com as principais tendências.',
      button: 'Ler Agora',
      route: 'Atualizacoes',
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

  const perfilStyle = getPerfilStyle(perfil);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 12 }}>Carregando seu perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}>
        <View style={styles.topBar}>
          <Text style={styles.header}>Olá, {userName || 'Investidor'}</Text>

          <View style={styles.rightButtons}>
            {perfil && (
              <View
                style={[
                  styles.perfilBadge,
                  {
                    backgroundColor: perfilStyle.backgroundColor,
                    borderColor: perfilStyle.borderColor,
                  },
                ]}
              >
                <Text style={[styles.perfilText, { color: perfilStyle.color }]}>
                  Perfil: {perfil}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.grid, isMobile && styles.gridMobile]}>
          {cards.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                isMobile ? styles.cardMobile : styles.cardWeb,
              ]}
            >
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
    </SafeAreaView>
  );
}

const CARD_GAP = 16;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  containerMobile: {
    paddingHorizontal: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  perfilBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  perfilText: {
    fontWeight: '600',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: CARD_GAP,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardWeb: {
    flexBasis: '48%',
    marginLeft: CARD_GAP / 2,
    marginRight: CARD_GAP / 2,
  },
  cardMobile: {
    width: '100%',
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
});
