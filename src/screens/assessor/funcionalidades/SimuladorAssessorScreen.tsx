import React, { memo, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type SeriePoint = { month: number; invested: number; balance: number; interest: number };

/* ===================== PALETA (padrão azul) ===================== */
const COLORS = {
  investedLine: '#6B7280',  // cinza para "investido"
  totalLine:    '#2563EB',  // azul para "total"
  gridMain:     '#E8EDFF',
  gridAxis:     '#D5DDF7',
  hintText:     '#6B7280',
};

/* ===================== COMPONENTES EXTRAÍDOS ===================== */
const UnitToggle = memo(function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: [string, string];
  value: string;
  onChange: (v: string) => void;
}) {
  const [left, right] = options;
  const isLeft = value === left;
  return (
    <View style={styles.inlineToggleBox}>
      <TouchableOpacity
        style={[styles.toggleHalf, isLeft && styles.toggleHalfActive]}
        onPress={() => onChange(left)}
      >
        <Text style={[styles.toggleHalfText, isLeft && styles.toggleHalfTextActive]} numberOfLines={1}>
          {left}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleHalf, !isLeft && styles.toggleHalfActive]}
        onPress={() => onChange(right)}
      >
        <Text style={[styles.toggleHalfText, !isLeft && styles.toggleHalfTextActive]} numberOfLines={1}>
          {right}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const InlineField = memo(function InlineField({
  label,
  placeholder,
  value,
  onChangeText,
  leftPrefix,
  rightToggle,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  leftPrefix?: string;
  rightToggle?: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inlineField]}>
        {leftPrefix ? (
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>{leftPrefix}</Text>
          </View>
        ) : null}
        <View style={styles.inlineCenter}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9AA0A6"
            keyboardType="decimal-pad"
            inputMode="decimal"
            style={styles.inlineInput}
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        {rightToggle}
      </View>
    </View>
  );
});

/* ============ SummaryItem (cards do Resumo, sem quebra de linha) ============ */
const SummaryItem = memo(function SummaryItem({
  label,
  value,
  widthPct,
  highlight = false,
}: {
  label: string;
  value: string;
  widthPct: '100%' | '48%' | '32%';
  highlight?: boolean;
}) {
  return (
    <View style={[styles.summaryItem, { width: widthPct }]}>
      <Text style={styles.summaryLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        ellipsizeMode="clip"
      >
        {value}
      </Text>
    </View>
  );
});

/* ===================== CHART (Y à direita só quando precisa + seta com fade) ===================== */
const Chart = memo(function Chart({
  serie,
  width: screenWidth,
  formatCurrency,
}: {
  serie: SeriePoint[];
  width: number;
  formatCurrency: (n: number) => string;
}) {
  const [containerW, setContainerW] = useState(0);
  const [arrowOpacity, setArrowOpacity] = useState(1); // 1 -> 0 conforme rola

  if (serie.length === 0) {
    return (
      <View onLayout={(e) => setContainerW(e.nativeEvent.layout.width)} style={[styles.chartEmpty, { width: '100%' }]}>
        <Text style={styles.chartEmptyText}>Preencha os campos e veja o gráfico aqui.</Text>
      </View>
    );
  }

  // largura efetiva do card (usa medição real; fallback aproximado)
  const approxInnerW = Math.max(320, Math.floor(screenWidth - (20 + 20 + 16 + 16 + 12 + 12)));
  const innerW = containerW > 0 ? containerW : approxInnerW;

  // Escala Y sem folga (consome 100% da altura)
  const rawMax = Math.max(...serie.map((p) => p.balance), 1);
  const maxY = rawMax;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxY);

  // Geometria
  const chartHeight = 320;
  const leftAxisWidth = 80;
  const rightAxisWidth = 80; // eixo direito (pode ocultar)
  const bottomAxis = 32;

  // ocupa toda a largura; cria scroll só se precisar
  const targetPlotW = Math.max(160, innerW - leftAxisWidth - rightAxisWidth);
  const minStep = 28, maxStep = 64;
  const stepXRaw = serie.length > 1 ? targetPlotW / (serie.length - 1) : targetPlotW;
  const stepX = Math.max(minStep, Math.min(maxStep, Math.floor(stepXRaw)));
  const contentWidth = leftAxisWidth + (serie.length - 1) * stepX + rightAxisWidth;

  const yToPx = (v: number) => {
    const h = chartHeight - bottomAxis;
    return Math.max(0, Math.min(h, h * (1 - (maxY === 0 ? 0 : v / maxY))));
  };

  const ptsInvested = serie.map((p, i) => ({ x: leftAxisWidth + i * stepX, y: yToPx(p.invested) }));
  const ptsTotal    = serie.map((p, i) => ({ x: leftAxisWidth + i * stepX, y: yToPx(p.balance) }));

  // linhas (sem bolinhas)
  const renderPolyline = (pts: { x: number; y: number }[], color: string, thickness = 3) => {
    const els: React.ReactNode[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      els.push(
        <View
          key={`seg-${i}`}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y,
            width: len,
            height: thickness,
            backgroundColor: color,
            transform: [{ rotateZ: `${ang}deg` }],
            borderRadius: thickness,
            opacity: 0.98,
          }}
        />
      );
    }
    return els;
  };

  const maxXLabels = 12;
  const xStepLabels = Math.max(1, Math.floor(serie.length / (maxXLabels - 1)));
  const isScrollable = contentWidth > innerW;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isScrollable) return;
    const x = e.nativeEvent.contentOffset.x;
    // fade suave da seta: some até x≈80px
    const newOpacity = Math.max(0, Math.min(1, 1 - x / 80));
    setArrowOpacity(newOpacity);
  };

  return (
    <View
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
      style={{ width: '100%', position: 'relative' }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lineChartWrap}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ width: Math.max(contentWidth, innerW) }}>
          <View style={{ height: chartHeight, position: 'relative' }}>
            {/* Grid */}
            {yTicks.map((t, i) => {
              const top = (chartHeight - bottomAxis) * (1 - (maxY === 0 ? 0 : t / maxY));
              return (
                <View
                  key={`g-${i}`}
                  style={{
                    position: 'absolute',
                    left: leftAxisWidth,
                    right: isScrollable ? rightAxisWidth : 0,
                    top,
                    height: 1,
                    backgroundColor: i === 0 ? COLORS.gridAxis : COLORS.gridMain,
                  }}
                />
              );
            })}

            {/* Eixo Y esquerdo */}
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: bottomAxis, width: leftAxisWidth }}>
              <View style={{ height: chartHeight - bottomAxis, justifyContent: 'space-between', paddingRight: 8 }}>
                {[...yTicks].reverse().map((v, i) => (
                  <Text key={`yl-${i}`} style={styles.yAxisText}>
                    {formatCurrency(v)}
                  </Text>
                ))}
              </View>
            </View>

            {/* Eixo Y direito (só se houver rolagem) */}
            {isScrollable && (
              <View style={{ position: 'absolute', right: 0, top: 0, bottom: bottomAxis, width: rightAxisWidth }}>
                <View style={{ height: chartHeight - bottomAxis, justifyContent: 'space-between', paddingLeft: 8 }}>
                  {[...yTicks].reverse().map((v, i) => (
                    <Text key={`yr-${i}`} style={[styles.yAxisText, { textAlign: 'right' }]}>
                      {formatCurrency(v)}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Linhas contínuas */}
            {renderPolyline(ptsInvested, COLORS.investedLine, 3)}
            {renderPolyline(ptsTotal, COLORS.totalLine, 4)}

            {/* Eixo X */}
            <View
              style={{
                position: 'absolute',
                left: leftAxisWidth,
                right: isScrollable ? rightAxisWidth : 0,
                bottom: 0,
                height: bottomAxis,
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                {serie.map((p, idx) => {
                  const show = idx % xStepLabels === 0 || idx === serie.length - 1;
                  return (
                    <View key={`xl-${idx}`} style={{ width: stepX, alignItems: 'center' }}>
                      {show ? <Text style={styles.xAxisText}>{idx}m</Text> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Seta “arraste” – só se houver scroll; some gradualmente com a rolagem */}
      {isScrollable && arrowOpacity > 0.02 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 8,
            top: 12 + (chartHeight - 32 - 20) / 2,
            opacity: arrowOpacity,
          }}
        >
          <Ionicons name="arrow-forward-circle-outline" size={20} color={COLORS.hintText} />
        </View>
      )}
    </View>
  );
});

/* ===================== TELA ===================== */
export default function SimuladorAssessorScreen() {
  const navigation = useNavigation();

  // Inputs (texto cru)
  const [aporteInicial, setAporteInicial] = useState('');
  const [aporteMensal, setAporteMensal] = useState('');
  const [taxaPctStr, setTaxaPctStr] = useState('');       // em %
  const [prazoValorStr, setPrazoValorStr] = useState(''); // número
  const [taxaBase, setTaxaBase] = useState<'anual' | 'mensal'>('mensal');
  const [prazoBase, setPrazoBase] = useState<'mes(es)' | 'anos'>('mes(es)');

  const width = Dimensions.get('window').width;

  // Helpers
  const toNumberLoose = (v: string) => {
    if (!v) return 0;
    const cleaned = (v + '').replace(/[^0-9.,\-]/g, '');
    const parts = cleaned.split(/[,\.](?=[^,\.]*$)/); // último separador
    if (parts.length === 1) return Number(parts[0]) || 0;
    const intPart = parts[0].replace(/[.,]/g, '');
    const decPart = parts[1];
    const num = Number(`${intPart}.${decPart}`);
    return Number.isFinite(num) ? num : 0;
  };

  const formatCurrency = (n: number) =>
    `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatPercent = (n: number) =>
    `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

  // Série
  const serie: SeriePoint[] = useMemo(() => {
    const taxaPct = toNumberLoose(taxaPctStr) / 100;
    const prazoNum = toNumberLoose(prazoValorStr);
    const meses = Math.max(0, Math.floor(prazoNum * (prazoBase === 'anos' ? 12 : 1)));
    if (meses <= 0 || taxaPct < 0) return [];

    const P0 = toNumberLoose(aporteInicial);
    const Pm = toNumberLoose(aporteMensal);
    const i = taxaBase === 'anual' ? Math.pow(1 + taxaPct, 1 / 12) - 1 : taxaPct;

    let saldo = P0;
    let invested = P0;
    const out: SeriePoint[] = [{ month: 0, invested, balance: saldo, interest: Math.max(0, saldo - invested) }];

    for (let m = 1; m <= meses; m++) {
      saldo = saldo * (1 + i); // rende
      saldo += Pm;             // aporte
      invested += Pm;
      out.push({ month: m, invested, balance: saldo, interest: Math.max(0, saldo - invested) });
    }
    return out;
  }, [aporteInicial, aporteMensal, taxaPctStr, prazoValorStr, taxaBase, prazoBase]);

  const resumo = useMemo(() => {
    if (serie.length === 0) return { invested: 0, interest: 0, balance: 0 };
    const last = serie[serie.length - 1];
    return { invested: last.invested, interest: last.interest, balance: last.balance };
  }, [serie]);

  const rentPct = resumo.invested > 0 ? (resumo.interest / resumo.invested) * 100 : 0;

  const onAjuda = () =>
    Alert.alert(
      'Como calculamos',
      '• Aporte inicial no mês 0\n• Capitalização composta mensal\n• Ordem: rende → entra aporte\n• Se a taxa for anual, convertemos para mensal por equivalência\n• Período em anos vira meses'
    );

  // Render
  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.header}>Ferramentas de Simulação</Text>
            <TouchableOpacity onPress={onAjuda} style={{ padding: 6 }}>
              <Ionicons name="help-circle-outline" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Parâmetros */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Parâmetros da Simulação</Text>

            {/* Aportes */}
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Aporte inicial (R$)</Text>
                <TextInput
                  value={aporteInicial}
                  onChangeText={setAporteInicial}
                  placeholder="Ex.: 10.000"
                  placeholderTextColor="#9AA0A6"
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  style={styles.input}
                  blurOnSubmit={false}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Aporte mensal (R$)</Text>
                <TextInput
                  value={aporteMensal}
                  onChangeText={setAporteMensal}
                  placeholder="Ex.: 1.000"
                  placeholderTextColor="#9AA0A6"
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  style={styles.input}
                  blurOnSubmit={false}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Taxa de Juros (mensal à esquerda, anual à direita) */}
            <InlineField
              label="Taxa de Juros"
              placeholder={taxaBase === 'anual' ? 'Ex.: 12' : 'Ex.: 1'}
              value={taxaPctStr}
              onChangeText={setTaxaPctStr}
              leftPrefix="%"
              rightToggle={
                <UnitToggle
                  options={['mensal', 'anual']}
                  value={taxaBase}
                  onChange={(v) => setTaxaBase(v as 'anual' | 'mensal')}
                />
              }
            />

            {/* Período (meses à esquerda, anos à direita) */}
            <InlineField
              label="Período"
              placeholder={prazoBase === 'anos' ? 'Ex.: 5' : 'Ex.: 60'}
              value={prazoValorStr}
              onChangeText={setPrazoValorStr}
              rightToggle={
                <UnitToggle
                  options={['mes(es)', 'anos']}
                  value={prazoBase}
                  onChange={(v) => setPrazoBase(v as 'mes(es)' | 'anos')}
                />
              }
            />
          </View>

          {/* Gráfico */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Projeção Gráfica</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.investedLine }]} />
                <Text style={styles.legendText}>Valor investido</Text>
                <View style={{ width: 12 }} />
                <View style={[styles.legendDot, { backgroundColor: COLORS.totalLine }]} />
                <Text style={styles.legendText}>Valor total</Text>
              </View>
            </View>
            <Chart serie={serie} width={width} formatCurrency={formatCurrency} />
          </View>

          {/* Resumo (2x2 fixo, sem quebra) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumo</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Total investido"
                value={formatCurrency(resumo.invested)}
                widthPct="48%"
              />
              <SummaryItem
                label="Juros acumulados"
                value={formatCurrency(resumo.interest)}
                widthPct="48%"
              />
              <SummaryItem
                label="Saldo final"
                value={formatCurrency(resumo.balance)}
                widthPct="48%"
                highlight
              />
              <SummaryItem
                label="Rentabilidade (acum.)"
                value={formatPercent(rentPct)}
                widthPct="48%"
              />
            </View>
          </View>

          <View style={styles.separator} />
          <Text style={styles.footnote}>
          O saldo final considera o total investido somado aos rendimentos compostos. Os juros acumulados mostram quanto seu dinheiro cresceu além dos aportes.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  header: { fontSize: 20, fontWeight: '700', color: '#222', textAlign: 'center', flex: 1 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },

  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  label: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: '500' },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111',
  },

  // Campo inline com toggle
  inlineField: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F4F4F4',
    overflow: 'hidden',
    marginBottom: 12,
  },
  prefixBox: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: '#E1E4EA',
    backgroundColor: '#EBEFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: { fontSize: 13, fontWeight: '700', color: '#3C4043' },
  inlineCenter: { flex: 1, justifyContent: 'center' },
  inlineInput: { paddingHorizontal: 12, fontSize: 14, color: '#111' },
  inlineToggleBox: {
    width: 140,
    borderLeftWidth: 1,
    borderLeftColor: '#DDE3F0',
    backgroundColor: '#ECEFF7',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  toggleHalf: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleHalfActive: { backgroundColor: '#FFFFFF' },
  toggleHalfText: { fontSize: 12, color: '#5F6368', fontWeight: '600', paddingVertical: 6, paddingHorizontal: 6 },
  toggleHalfTextActive: { color: '#1A73E8' },

  // Chart container
  lineChartWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  yAxisText: { fontSize: 11, color: '#6B7280' },
  xAxisText: { fontSize: 11, color: '#6B7280' },
  chartEmpty: {
    height: 320,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFBFB',
  },
  chartEmptyText: { color: '#777', fontSize: 13 },

  // Legenda
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#555', fontWeight: '500' },

  // Resumo (2x2)
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E5EDFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryLabel: { fontSize: 12, color: '#667085', marginBottom: 6, fontWeight: '600' },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    includeFontPadding: false,
  },
  summaryValueHighlight: { color: '#1D4ED8' },

  separator: { height: 1, backgroundColor: '#eee', marginTop: 10, marginBottom: 8, width: '100%' },
  footnote: { fontSize: 12, color: '#666' },
});