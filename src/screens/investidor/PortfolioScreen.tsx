import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface PortfolioData {
  valorTotal?: number;
  crescimento?: number;
  retorno?: number;
  alocacao?: {
    acoes?: number;
    rendaFixa?: number;
    imoveis?: number;
    liquidez?: number;
  };
}

export default function PortfolioScreen() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((res) => setTimeout(res, 1500));

      const result = {
        valorTotal: undefined,
        crescimento: undefined,
        retorno: undefined,
        alocacao: {
          acoes: undefined,
          rendaFixa: undefined,
          imoveis: undefined,
          liquidez: undefined,
        },
      };

      setData(result);
      setLoading(false);
    };

    fetchData();
  }, []);

  const alocacao = data?.alocacao || {};

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingTitle}>Aguarde um instante...</Text>
          <Text style={styles.loadingSubtitle}>Estamos preparando seu portfólio personalizado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderValue = (label: string, value?: number, isCurrency = false) => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={value !== undefined ? styles.cardValue : styles.cardUnavailable}>
        {value !== undefined
          ? isCurrency
            ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : `${value}%`
          : 'Indisponível'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Desempenho</Text>
        <View style={styles.cardRow}>
          {renderValue('Valor Total', data?.valorTotal, true)}
          {renderValue('Crescimento', data?.crescimento, true)}
        </View>
        <View style={styles.cardFull}>
          <Text style={styles.cardLabel}>Retornos</Text>
          <Text style={data?.retorno !== undefined ? styles.cardValue : styles.cardUnavailable}>
            {data?.retorno !== undefined ? `${data.retorno}%` : 'Indisponível'}
          </Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Alocação de Ativos</Text>
        <View style={styles.chartContainer}>
          <View style={[styles.bar, { height: (alocacao.acoes ?? 5) + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.rendaFixa ?? 5) + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.imoveis ?? 5) + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.liquidez ?? 5) + 20 }]} />
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel} numberOfLines={1} ellipsizeMode="tail">Ações</Text>
          <Text style={styles.chartLabel} numberOfLines={1} ellipsizeMode="tail">Renda Fixa</Text>
          <Text style={styles.chartLabel} numberOfLines={1} ellipsizeMode="tail">Imóveis</Text>
          <Text style={styles.chartLabel} numberOfLines={1} ellipsizeMode="tail">Liquidez</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Diversificação</Text>
        <View style={styles.diversificationRow}>
          <View style={styles.divColumn}>
            <Text style={styles.divLabel}>Ações</Text>
            <Text style={styles.divValue}>
              {alocacao.acoes !== undefined ? `${alocacao.acoes}%` : '–'}
            </Text>
          </View>
          <View style={styles.divColumn}>
            <Text style={styles.divLabel}>Renda Fixa</Text>
            <Text style={styles.divValue}>
              {alocacao.rendaFixa !== undefined ? `${alocacao.rendaFixa}%` : '–'}
            </Text>
          </View>
        </View>
        <View style={styles.diversificationRow}>
          <View style={styles.divColumn}>
            <Text style={styles.divLabel}>Imóveis</Text>
            <Text style={styles.divValue}>
              {alocacao.imoveis !== undefined ? `${alocacao.imoveis}%` : '–'}
            </Text>
          </View>
          <View style={styles.divColumn}>
            <Text style={styles.divLabel}>Liquidez</Text>
            <Text style={styles.divValue}>
              {alocacao.liquidez !== undefined ? `${alocacao.liquidez}%` : '–'}
            </Text>
          </View>
        </View>
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
    paddingTop: 12,
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
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardFull: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#777',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
    color: '#222',
  },
  cardUnavailable: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 6,
    color: '#BBB',
    fontStyle: 'italic',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    height: 120,
    paddingHorizontal: 4,
  },
  bar: {
    width: 50,
    backgroundColor: '#D0D8F0',
    borderRadius: 8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    textAlign: 'center',
    minWidth: 60,
    color: '#666',
  },
  diversificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  divColumn: {
    width: '48%',
  },
  divLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  divValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
}
});
