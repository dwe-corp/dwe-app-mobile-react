import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getUserRiskProfile } from '../../services/suitabilityService';
import { getPortfolioSummary } from '../../services/portfolioService';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { userName, userEmail } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ total?: number; updatedAt?: string } | null>(null);
  const [showValues, setShowValues] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        const perfilRisco = await getUserRiskProfile(userEmail);
        setPerfil(perfilRisco);
        
        //TO-DO: Criar a API
        //const portfolioData = await getPortfolioSummary(userEmail);
        //setSummary(portfolioData);
      } catch (error) {
        console.log('Erro ao buscar perfil ou resumo');
        setPerfil(null);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail, isFocused]);

  const getPerfilStyle = (perfil: string | undefined | null) => {
    switch (perfil?.toUpperCase()) {
      case 'CONSERVADOR':
        return { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7', color: '#2E7D32' };
      case 'MODERADO':
        return { backgroundColor: '#FFF8E1', borderColor: '#FFE082', color: '#F57F17' };
      case 'AGRESSIVO':
        return { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A', color: '#C62828' };
      default:
        return { backgroundColor: '#E6F0FF', borderColor: '#B0D4FF', color: '#007AFF' };
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
      route: 'AtualizacoesInvestidor',
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
      title: 'Fale com a Nina',
      desc: 'Receba suporte inteligente para decisões de investimento.',
      button: 'Conversar Agora',
      route: 'IA',
      image: require('../../assets/robot.png'),
    },
  ];

  const perfilStyle = getPerfilStyle(perfil);

  const formatCurrency = (value?: number) =>
    value !== undefined ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Indisponível';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Indisponível';
    const date = new Date(dateString);
    return `Atualizado em ${date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingTitle}>Carregando informações...</Text>
          <Text style={styles.loadingSubtitle}>Estamos preparando seu dashboard personalizado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
            Olá, {userName?.split(' ')[0] || 'Investidor'}
          </Text>

          <View style={styles.rightButtons}>
            {perfil ? (
              <View style={[styles.perfilBadge, { backgroundColor: perfilStyle.backgroundColor, borderColor: perfilStyle.borderColor }]}>
                <Text style={[styles.perfilText, { color: perfilStyle.color }]}>
                  Perfil: {perfil}
                </Text>
              </View>
            ) : (
              <View style={[styles.perfilBadge, { backgroundColor: '#f0f0f0', borderColor: '#ccc' }]}>
                <Text style={[styles.perfilText, { color: '#888' }]}>Perfil não definido</Text>
              </View>
            )}
          </View>
        </View>

        {/* Resumo com botão de ocultar */}
        <View style={styles.summaryBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Patrimônio</Text>
            <Text style={styles.summaryValue}>
              {showValues ? formatCurrency(summary?.total) : '••••••••'}
            </Text>
            <Text style={styles.summaryDate}>{formatDate(summary?.updatedAt)}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowValues(!showValues)}>
            <Ionicons
              name={showValues ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Cards */}
        {cards.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.desc}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(item.route)}>
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
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginVertical: 4,
  },
  summaryDate: {
    fontSize: 12,
    color: '#666',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
    maxWidth: '70%',
    flexShrink: 1,
    overflow: 'hidden',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FAFAFA',
  },
  loadingTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
});
