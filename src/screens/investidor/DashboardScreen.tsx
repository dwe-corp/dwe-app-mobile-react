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
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getUserRiskProfile } from '../../services/suitabilityService';

export default function DashboardScreen() {
  const { userName, userEmail } = useAuth();
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
      try {
        const perfilRisco = await getUserRiskProfile(userEmail);
        setPerfil(perfilRisco);
      } catch (error) {
        console.log('Usuário ainda não tem perfil registrado.');
        setPerfil(null);
      } finally {
        setLoading(false);
      }
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
      image: require('../../assets/teste.png'),
    },
    {
      title: 'Atualizações de Mercado',
      desc: 'Receba boletins semanais com as principais tendências.',
      button: 'Ler Agora',
      route: 'Atualizacoes',
      image: require('../../assets/news-home.png'),
    },
    {
      title: 'Investimentos',
      desc: 'Explore opções de fundos com explicações simples.',
      button: 'Ver Fundos',
      route: 'Fundos',
      image: require('../../assets/chart-home.png'),
    },
    {
      title: 'Assistente com IA',
      desc: 'Receba suporte inteligente para decisões de investimento.',
      button: 'Conversar Agora',
      route: 'IA',
      image: require('../../assets/robot.png'),
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
            {perfil ? (
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
            ) : (
              <View
                style={[
                  styles.perfilBadge,
                  { backgroundColor: '#f0f0f0', borderColor: '#ccc' },
                ]}
              >
                <Text style={[styles.perfilText, { color: '#888' }]}>
                  Perfil não definido
                </Text>
              </View>
            )}
          </View>
        </View>

        {cards.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.desc}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <Text style={styles.buttonText}>{item.button}</Text>
                </TouchableOpacity>
              </View>
              <Image source={item.image} style={styles.cardImage} />
            </View>

            {idx !== cards.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  containerMobile: {
    paddingHorizontal: 12,
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
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfilBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
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
    color: '#111',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
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
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
    width: '100%',
  },
});
