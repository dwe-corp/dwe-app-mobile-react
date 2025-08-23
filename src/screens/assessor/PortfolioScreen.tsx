import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Circle } from 'react-native-svg';

type ChartType = 'bar' | 'pie';

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

/** ---------- Switch de gráfico (Bar / Pie) ---------- */
function ChartTypeSwitch({
    value,
    onToggle,
  }: { value: 'bar' | 'pie'; onToggle: () => void }) {
    const anim = useRef(new Animated.Value(value === 'pie' ? 1 : 0)).current;
  
    useEffect(() => {
      Animated.spring(anim, {
        toValue: value === 'pie' ? 1 : 0,
        useNativeDriver: true,
        bounciness: 10,
        speed: 10,
      }).start();
    }, [value]);
  
    const TRACK_W = 72;
    const TRACK_H = 32;
    const PADDING = 6.5;
    const THUMB = 26;
    const TRAVEL = TRACK_W - THUMB - PADDING * 2;
    const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });
  
    return (
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.9}
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: '#f0f1f6',
          padding: PADDING,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Ícones fixos */}
        <View style={{
          position: 'absolute',
          left: 12,
          right: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Ionicons
            name="bar-chart-outline"
            size={18}
            color={value === 'bar' ? '#007AFF' : '#aaa'}
          />
          <Ionicons
            name="pie-chart-outline"
            size={18}
            color={value === 'pie' ? '#34C759' : '#aaa'}
          />
        </View>
  
        {/* Thumb */}
        <Animated.View
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: '#fff',
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
          }}
        />
      </TouchableOpacity>
    );
  }

export default function PortfolioScreen() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((res) => setTimeout(res, 800));
      setData({
        valorTotal: undefined,
        crescimento: undefined,
        retorno: undefined,
        alocacao: { acoes: undefined, rendaFixa: undefined, imoveis: undefined, liquidez: undefined },
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  const alocacao = data?.alocacao || {};

  // ---------- Helpers de Pizza ----------
  const normalized = useMemo(() => {
    const a = Number(alocacao.acoes ?? 0);
    const rf = Number(alocacao.rendaFixa ?? 0);
    const im = Number(alocacao.imoveis ?? 0);
    const li = Number(alocacao.liquidez ?? 0);
    const total = a + rf + im + li;
    return {
      total,
      parts: [
        { key: 'Ações', value: a },
        { key: 'Renda Fixa', value: rf },
        { key: 'Imóveis', value: im },
        { key: 'Liquidez', value: li },
      ],
    };
  }, [alocacao]);

  const makeArcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const polar = (R: number, ang: number) => {
      const rad = ((ang - 90) * Math.PI) / 180;
      return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
    };
    const start = polar(r, endDeg);
    const end = polar(r, startDeg);
    const large = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
  };

  const PIE_COLORS = ['#5B8FF9', '#61DDAA', '#65789B', '#F6BD16'];

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

  const renderBars = () => {
    const minH = 5;
    return (
      <>
        <View style={styles.chartContainer}>
          <View style={[styles.bar, { height: (alocacao.acoes ?? 0) > 0 ? (alocacao.acoes as number) + 20 : minH + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.rendaFixa ?? 0) > 0 ? (alocacao.rendaFixa as number) + 20 : minH + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.imoveis ?? 0) > 0 ? (alocacao.imoveis as number) + 20 : minH + 20 }]} />
          <View style={[styles.bar, { height: (alocacao.liquidez ?? 0) > 0 ? (alocacao.liquidez as number) + 20 : minH + 20 }]} />
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Ações</Text>
          <Text style={styles.chartLabel}>Renda Fixa</Text>
          <Text style={styles.chartLabel}>Imóveis</Text>
          <Text style={styles.chartLabel}>Liquidez</Text>
        </View>
      </>
    );
  };

  const renderPie = () => {
    const size = 220;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 100;
    const innerR = 58;

    if (normalized.total <= 0) {
      return (
        <View style={styles.pieWrapper}>
          <Svg width={size} height={size}>
            <G>
              <Circle cx={cx} cy={cy} r={outerR} fill="#F2F2F2" />
              <Circle cx={cx} cy={cy} r={innerR} fill="#FAFAFA" />
            </G>
          </Svg>
          <Text style={styles.noDataText}>Sem dados de alocação</Text>
        </View>
      );
    }

    let start = 0;
    const paths: { d: string; color: string }[] = [];
    normalized.parts.forEach((p, i) => {
      if (p.value <= 0) return;
      const sweep = (p.value / normalized.total) * 360;
      const end = start + sweep;
      const outer = makeArcPath(cx, cy, outerR, start, end);
      const inner = makeArcPath(cx, cy, innerR, end, start);
      paths.push({ d: `${outer} L ${cx} ${cy} ${inner} Z`, color: PIE_COLORS[i % PIE_COLORS.length] });
      start = end;
    });

    return (
      <>
        <View style={styles.pieWrapper}>
          <Svg width={size} height={size}>
            <G>
              {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} />)}
              <Circle cx={cx} cy={cy} r={innerR} fill="#FAFAFA" />
            </G>
          </Svg>
        </View>
        <View style={styles.legend}>
          {normalized.parts.map((p, i) => (
            <View key={p.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }]} />
              <Text style={styles.legendText}>
                {p.key} — {normalized.total > 0 ? `${((p.value / normalized.total) * 100).toFixed(0)}%` : '0%'}
              </Text>
            </View>
          ))}
        </View>
      </>
    );
  };

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

        {/* Título + switch à direita (ESSA LINHA É A CHAVE) */}
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
            Alocação de Ativos
          </Text>

          <ChartTypeSwitch
            value={chartType}
            onToggle={() => setChartType(prev => (prev === 'bar' ? 'pie' : 'bar'))}
          />
        </View>

        {chartType === 'bar' ? renderBars() : renderPie()}

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

      {/* Botão flutuante de IA */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('IA' as never)}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222' },

  // Título + switch na mesma linha
  titleRow: {
    marginTop: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Switch
  switchTrack: {
    backgroundColor: '#E9E9EF',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  switchIconsRow: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  switchThumb: {
    backgroundColor: '#fff',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
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
  cardLabel: { fontSize: 14, color: '#777' },
  cardValue: { fontSize: 18, fontWeight: '600', marginTop: 6, color: '#222' },
  cardUnavailable: { fontSize: 18, fontWeight: '500', marginTop: 6, color: '#BBB', fontStyle: 'italic' },

  // Barras
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    height: 120,
    paddingHorizontal: 4,
  },
  bar: { width: 50, backgroundColor: '#D0D8F0', borderRadius: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  chartLabel: { fontSize: 12, textAlign: 'center', minWidth: 60, color: '#666' },

  // Pizza
  pieWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  legend: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 13, color: '#444' },
  noDataText: { marginTop: 10, color: '#999', fontStyle: 'italic' },

  // Diversificação
  diversificationRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  divColumn: { width: '48%' },
  divLabel: { fontSize: 14, color: '#999', marginBottom: 4 },
  divValue: { fontSize: 16, fontWeight: '600', color: '#333' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: '#FAFAFA' },
  loadingTitle: { marginTop: 20, fontSize: 18, fontWeight: '600', color: '#333' },
  loadingSubtitle: { fontSize: 14, color: '#888', marginTop: 6, textAlign: 'center' },

  separator: { height: 1, backgroundColor: '#eee', marginVertical: 20, width: '100%' },

  // FAB
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