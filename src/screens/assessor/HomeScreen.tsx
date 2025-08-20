import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPortfolioSummary } from '../../services/portfolioService';
// TO-DO: implemente esse service para retornar o total de clientes do assessor pelo e-mail
// import { getAssessorClientsCount } from '../../services/clientsService';

export default function HomeScreen() {
  const { logout, userName, userEmail } = useAuth();
  const navigation = useNavigation();

  const [summary, setSummary] = useState<{ total?: number; updatedAt?: string } | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [clientsCount, setClientsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!userEmail) return;
      try {
        const portfolioData = await getPortfolioSummary(userEmail);
        setSummary(portfolioData);
      } catch {
        setSummary(null);
      }
    };
    const fetchClients = async () => {
      if (!userEmail) return;
      try {
        const total = await getAssessorClientsCount(userEmail);
        setClientsCount(total ?? 0);
      } catch {
        setClientsCount(null);
      }
    };
    fetchSummary();
    fetchClients();
  }, [userEmail]);

  const formatCurrency = (value?: number) =>
    value !== undefined
      ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'Indisponível';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Indisponível';
    const date = new Date(dateString);
    return `Atualizado em ${date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
  };

  // 0 clientes => cinza (igual null)
  const getClientsBadgeStyle = (count: number | null) => {
    if (count === null || count === 0) {
      return { bg: '#f0f0f0', border: '#ccc', text: '#888' }; // cinza
    }
    if (count >= 100) {
      return { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828' }; // vermelho
    }
    if (count >= 50) {
      return { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17' }; // amarelo
    }
    return { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' }; // verde
  };

  const badge = getClientsBadgeStyle(clientsCount);

  // Cards no mesmo padrão do DashboardScreen (com imagem)
  const cards = [
    {
      title: 'Relatórios de Clientes',
      desc: 'Acesse relatórios completos dos portfólios dos seus clientes, incluindo performance, alocação e risco.',
      button: 'Ver Relatórios',
      route: 'Relatorios',
      image: require('../../assets/chart-home.png'),
    },
    {
      title: 'Ferramentas de Simulação',
      desc: 'Simule diferentes carteiras para mostrar aos seus clientes os possíveis cenários de retorno.',
      button: 'Simular Carteira',
      route: 'Simulador',
      image: require('../../assets/teste.png'),
    },
    {
      title: 'Lembretes Inteligentes',
      desc: 'Programe lembretes para reuniões, revisões de carteira e datas importantes.',
      button: 'Verificar Lembretes',
      route: 'Lembretes',
      image: require('../../assets/news-home.png'),
    },
    {
      title: 'Suporte ao Cliente',
      desc: 'Acompanhe o atendimento e envie mensagens personalizadas para seus clientes.',
      button: 'Abrir Chat',
      route: 'Chat',
      image: require('../../assets/news-home.png'),
    },
    // Nina incluída
    {
      title: 'Fale com a Nina',
      desc: 'Assistente inteligente para apoiar suas decisões com seus clientes.',
      button: 'Conversar Agora',
      route: 'IA',
      image: require('../../assets/robot.png'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
            Olá, {userName?.split(' ')[0] || 'Assessor'}
          </Text>

          <View style={styles.rightButtons}>
            <View
              style={[
                styles.clientsBadge,
                { backgroundColor: badge.bg, borderColor: badge.border },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={badge.text}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.clientsText, { color: badge.text }]}>
                Clientes: {clientsCount ?? '0'}
              </Text>
            </View>
          </View>
        </View>

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

        {cards.map((item, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.cardRow}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.desc}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate(item.route as never)}
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
    gap: 8,
  },
  clientsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  clientsText: {
    fontWeight: '600',
    fontSize: 13,
  },
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
