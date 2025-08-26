import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Animated,
  PanResponder,
  Platform,
  LayoutAnimation,
  UIManager,
  Easing,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPortfolioSummary } from '../../services/portfolioService';

type AgendaItem = { id: string; titulo: string; date: string; time: string; route?: string };
type Movement = { type: 'aporte' | 'resgate'; amount: number; date: string }; // YYYY-MM-DD

/** Habilita LayoutAnimation no Android (para o painel de intervalo) */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** ----------------------------------------------------------------
 *  SwipeToDeleteRow (igual)
 * ----------------------------------------------------------------*/
const RIGHT_ACTION_W = 96;
const OPEN_THRESHOLD = 56;
const RUBBER_BAND = 0.3;
const EXTRA_DRAG = 24;

function SwipeToDeleteRow({
  children,
  onDelete,
  confirmMessage,
  height = 64,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  confirmMessage: string;
  height?: number;
  accessibilityLabel?: string;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const springTo = (to: number) =>
    Animated.spring(translateX, {
      toValue: to,
      useNativeDriver: true,
      friction: 16,
      tension: 80,
      restDisplacementThreshold: 0.2,
      restSpeedThreshold: 0.2,
    }).start();

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, g) =>
          Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
        onPanResponderGrant: () => {
          translateX.stopAnimation((val) => {
            currentX.current = val ?? currentX.current;
          });
        },
        onPanResponderMove: (_evt, g) => {
          const base = currentX.current + g.dx;
          let dx = Math.min(0, base);
          const limit = -RIGHT_ACTION_W;

          if (dx < limit) {
            const beyond = dx - limit;
            dx = limit + beyond * RUBBER_BAND;
            dx = Math.max(dx, -(RIGHT_ACTION_W + EXTRA_DRAG));
          }

          translateX.setValue(dx * 0.65);
        },
        onPanResponderRelease: () => {
          const pos = Math.abs(currentX.current);
          if (pos > OPEN_THRESHOLD) springTo(-RIGHT_ACTION_W);
          else springTo(0);
        },
        onPanResponderTerminate: () => {
          springTo(0);
        },
      }),
    [translateX]
  );

  const handleDelete = () => {
    Alert.alert('Excluir evento?', confirmMessage, [
      { text: 'Cancelar', style: 'cancel', onPress: () => springTo(0) },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete() },
    ]);
  };

  return (
    <View style={[styles.swipeContainer, { height }]}>
      <View style={[styles.underlay, { height, width: RIGHT_ACTION_W }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? 'Excluir'}
          style={styles.underlayContent}
          onPress={handleDelete}
          activeOpacity={0.9}
        >
          <Ionicons name="trash-outline" size={20} color="#B91C1C" />
          <Text style={styles.underlayText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.swipeCard, { height, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

/** ----------------------------------------------------------------
 *  Helpers de período
 * ----------------------------------------------------------------*/
type RangeKey = 'M' | '6M' | 'YTD' | 'CUSTOM';

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function formatBR(d: Date | null | undefined) {
  if (!d) return '--/--/----';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function getRangeDates(range: RangeKey, custom?: { start?: Date | null; end?: Date | null }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'CUSTOM') {
    const s = custom?.start ?? today;
    const e = custom?.end ?? today;
    return { startStr: toYMD(s), endStr: toYMD(e) };
  }
  if (range === 'M') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startStr: toYMD(start), endStr: toYMD(today) };
  }
  if (range === '6M') {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    return { startStr: toYMD(start), endStr: toYMD(today) };
  }
  const start = new Date(today.getFullYear(), 0, 1);
  return { startStr: toYMD(start), endStr: toYMD(today) };
}
function inRange(dateStr: string, startStr: string, endStr: string) {
  return dateStr >= startStr && dateStr <= endStr;
}

/** ----------------------------------------------------------------
 *  HomeScreen
 * ----------------------------------------------------------------*/
export default function HomeScreen() {
  const { userName, userEmail } = useAuth();
  const navigation = useNavigation();

  const [summary, setSummary] = useState<{ total?: number; updatedAt?: string } | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Períodos e movimentos
  const [movements, setMovements] = useState<Movement[]>([]);
  const [range, setRange] = useState<RangeKey>('M');

  // Intervalo customizado
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [showCustomPanel, setShowCustomPanel] = useState(false);

  // QuickActions
  const [showAllActions, setShowAllActions] = useState(false);
  const qaHeight = useRef(new Animated.Value(0)).current;   // altura animada do grid
  const [tileH, setTileH] = useState<number | null>(null);  // altura do tile (medida)
  const ROW_GAP = 10;
  const COLS = 3;

  const [tarefasCount] = useState<number>(3);
  const [upcomingEvents, setUpcomingEvents] = useState<AgendaItem[]>([]);

  const fetchSummary = useCallback(async () => {
    if (!userEmail) return;
    try {
      const portfolioData = await getPortfolioSummary(userEmail);
      setSummary(portfolioData);
    } catch {
      setSummary(null);
    }
  }, [userEmail]);

  const fetchClients = useCallback(async () => {
    try {
      setClientsCount(null);
    } catch {
      setClientsCount(null);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('@movements');
      const list: any[] = raw ? JSON.parse(raw) : [];
      const normalized: Movement[] = Array.isArray(list)
        ? list
            .filter(
              (m) =>
                (m?.type === 'aporte' || m?.type === 'resgate') &&
                typeof m?.amount === 'number' &&
                typeof m?.date === 'string'
            )
            .map((m) => ({ type: m.type, amount: m.amount, date: m.date }))
        : [];
      setMovements(normalized);
    } catch {
      setMovements([]);
    }
  }, []);

  const todayKey = () => {
    const d = new Date();
    return toYMD(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const fetchUpcoming = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('@events');
      const list = raw ? JSON.parse(raw) : [];
      const key = todayKey();

    const onlyNext: AgendaItem[] = list
      .filter((e: any) => typeof e?.date === 'string' && e.date >= key)
      .sort((a: any, b: any) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.time.localeCompare(b.time);
      })
      .map((e: any) => ({
        id: e.id,
        titulo: e.titulo,
        date: e.date,
        time: e.time,
        route: 'Agenda',
      }));

      setUpcomingEvents(onlyNext);
    } catch {
      setUpcomingEvents([]);
    }
  }, []);

  const deleteEventById = useCallback(async (eventId: string) => {
    try {
      const raw = await AsyncStorage.getItem('@events');
      const list = raw ? JSON.parse(raw) : [];
      const newList = list.filter((e: any) => e.id !== eventId);
      await AsyncStorage.setItem('@events', JSON.stringify(newList));
      setUpcomingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir o evento. Tente novamente.');
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchClients();
  }, [fetchSummary, fetchClients]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
      fetchClients();
      fetchMovements();
      fetchUpcoming();
    }, [fetchSummary, fetchClients, fetchMovements, fetchUpcoming])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([fetchSummary(), fetchClients(), fetchMovements(), fetchUpcoming()]);
    setRefreshing(false);
  }, [fetchSummary, fetchClients, fetchMovements, fetchUpcoming]);

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

  const getClientsBadgeStyle = (count: number | null) => {
    if (count === null || count === 0) return { bg: '#f6f6f6', border: '#ddd', text: '#777' };
    if (count >= 100) return { bg: '#FFECEC', border: '#F5C2C2', text: '#B91C1C' };
    if (count >= 50) return { bg: '#FFF6E5', border: '#FFE0A3', text: '#AD6B00' };
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' };
  };

  const badge = getClientsBadgeStyle(clientsCount);

  // Totais por período (considera 'CUSTOM')
  const { startStr, endStr } = useMemo(
    () => getRangeDates(range, { start: customStart ?? undefined, end: customEnd ?? undefined }),
    [range, customStart, customEnd]
  );

  const { aportesValue, resgatesValue } = useMemo(() => {
    if (!movements.length) return { aportesValue: 0, resgatesValue: 0 };
    let ap = 0;
    let re = 0;
    for (const m of movements) {
      if (!m?.date || !m?.type || typeof m?.amount !== 'number') continue;
      if (!inRange(m.date, startStr, endStr)) continue;
      if (m.type === 'aporte') ap += m.amount;
      if (m.type === 'resgate') re += m.amount;
    }
    return { aportesValue: ap, resgatesValue: re };
  }, [movements, startStr, endStr]);

  const rangeLabel =
    range === 'M' ? 'Mês' : range === '6M' ? '6 meses' : range === 'YTD' ? 'Ano' : 'Intervalo';

  // Itens de ação
  const quickActions: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    badgeCount?: number;
  }[] = [
    { label: 'Calculadora de Juros', icon: 'trending-up-outline', route: 'SimuladorAssessor' },
    { label: 'Relatórios de Clientes', icon: 'stats-chart-outline', route: 'PortfolioInvestidor' },
    { label: 'Atualizações de Mercado', icon: 'newspaper-outline', route: 'AtualizacoesInvestidor' },
    { label: 'Suporte ao Cliente', icon: 'chatbubbles-outline', route: 'Chat' },
    { label: 'Fale com a Nina', icon: 'sparkles-outline', route: 'IA' },
    { label: 'Adicionar Cliente', icon: 'person-add-outline', route: 'NovoCliente' },
    { label: 'Buscar Cliente', icon: 'search-outline', route: 'BuscarCliente' },
    { label: 'Agenda de Hoje', icon: 'time-outline', route: 'Agenda' },
    { label: 'Tarefas', icon: 'checkmark-done-outline', route: 'Tarefas', badgeCount: tarefasCount },
  ];

  /** -------- animação da grade: calcula alturas e anima -------- */
  const rowsFull = Math.ceil(quickActions.length / COLS);
  const heightCollapsed = tileH ?? 0; // 1 linha
  const heightFull = tileH ? tileH * rowsFull + ROW_GAP * (rowsFull - 1) : 0;

  // inicializa a altura animada quando descobrir a altura do tile
  useEffect(() => {
    if (tileH && qaHeight.__getValue() === 0) {
      qaHeight.setValue(heightCollapsed);
    }
  }, [tileH, heightCollapsed, qaHeight]);

  const animateQA = (expand: boolean) => {
    if (!tileH) return; // ainda não mediu
    Animated.timing(qaHeight, {
      toValue: expand ? heightFull : heightCollapsed,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animando 'height'
    }).start();
  };

  const toggleShowAllActions = () => {
    const next = !showAllActions;
    animateQA(next);
    setShowAllActions(next);
  };

  /** ----- handlers não relacionados à grade (mantive LayoutAnimation) ----- */
  const selectPresetRange = (rk: RangeKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRange(rk);
    setShowCustomPanel(false);
  };

  const toggleCustomPanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRange('CUSTOM');
    setShowCustomPanel((v) => !v);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd && customStart > customEnd) {
      Alert.alert('Intervalo inválido', 'A data inicial não pode ser maior que a final.');
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRange('CUSTOM');
    setShowCustomPanel(false);
  };

  const clearCustomRange = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCustomStart(null);
    setCustomEnd(null);
    setRange('M');
    setShowCustomPanel(false);
  };

  // --------- DateTimePicker helper (placeholder) ---------
  const pickDate = async (mode: 'start' | 'end') => {
    let DateTimePicker: any;
    try {
      DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch {
      Alert.alert(
        'Seletor de data',
        'Para escolher datas, instale @react-native-community/datetimepicker.\n\nEx.: npm i @react-native-community/datetimepicker'
      );
      return;
    }
    Alert.alert('Abra seu modal de calendário', `Selecione a data de ${mode === 'start' ? 'Início' : 'Fim'}.`);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
            Olá, {userName?.split(' ')[0] || 'Assessor'}
          </Text>

          <View
            style={[
              styles.clientsBadge,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <Ionicons name="people-outline" size={16} color={badge.text} style={{ marginRight: 6 }} />
            <Text style={[styles.clientsText, { color: badge.text }]}>
              Clientes: {clientsCount ?? '0'}
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS: sempre renderiza todas, mas o container tem altura animada.
            Itens além do 3º ficam sem toque e transparentes quando recolhido. */}
        <Animated.View style={[styles.actionsGrid, { height: tileH ? qaHeight : undefined, overflow: 'hidden' }]}>
          {quickActions.map((a, index) => {
            const hiddenWhenCollapsed = !showAllActions && index >= 3;
            return (
              <TouchableOpacity
                key={`${a.label}-${index}`}
                style={[styles.actionTile, hiddenWhenCollapsed && { opacity: 0 }]}
                onPress={() => navigation.navigate(a.route as never)}
                activeOpacity={0.9}
                accessible
                pointerEvents={hiddenWhenCollapsed ? 'none' : 'auto'}
                accessibilityLabel={`Abrir ${a.label}`}
                onLayout={index === 0 && !tileH ? (e) => setTileH(e.nativeEvent.layout.height) : undefined}
              >
                <Ionicons name={a.icon} size={22} color="#1F2937" />
                <Text style={styles.actionLabel} numberOfLines={2}>{a.label}</Text>

                {!!a.badgeCount && a.badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{a.badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={styles.moreRow}>
          <TouchableOpacity
            onPress={toggleShowAllActions}
            accessibilityLabel={showAllActions ? 'Mostrar menos opções' : 'Mostrar mais opções'}
            style={styles.moreLink}
            activeOpacity={0.7}
          >
            <Text style={styles.moreLinkText}>
              {showAllActions ? 'Mostrar menos' : 'Mais opções'}
            </Text>
            <Ionicons name={showAllActions ? 'chevron-up' : 'chevron-down'} size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Seletor de período + Intervalo */}
        <View style={styles.rangeRow}>
          {(['M','6M','YTD'] as RangeKey[]).map((rk) => (
            <TouchableOpacity
              key={rk}
              onPress={() => selectPresetRange(rk)}
              style={[styles.rangeChip, range === rk && styles.rangeChipActive]}
              accessibilityLabel={`Período ${rk === 'M' ? 'Mês' : rk === '6M' ? '6 meses' : 'Ano'}`}
            >
              <Text style={[styles.rangeChipText, range === rk && styles.rangeChipTextActive]}>
                {rk === 'M' ? 'Mês' : rk === '6M' ? '6 meses' : 'Ano'}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={toggleCustomPanel}
            style={[styles.rangeChipOutline, (range === 'CUSTOM') && styles.rangeChipOutlineActive]}
            accessibilityLabel="Selecionar intervalo de datas"
          >
            <Ionicons name="calendar-outline" size={14} color={range === 'CUSTOM' ? '#111827' : '#6B7280'} />
            <Text style={[styles.rangeChipOutlineText, (range === 'CUSTOM') && styles.rangeChipOutlineTextActive]}>
              Intervalo
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomPanel && (
          <View style={styles.customPanel}>
            <View style={styles.customRow}>
              <Text style={styles.customLabel}>Início</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => pickDate('start')}>
                <Ionicons name="calendar-clear-outline" size={16} color="#374151" />
                <Text style={styles.dateBtnText}>{formatBR(customStart)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.customRow}>
              <Text style={styles.customLabel}>Fim</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => pickDate('end')}>
                <Ionicons name="calendar-clear-outline" size={16} color="#374151" />
                <Text style={styles.dateBtnText}>{formatBR(customEnd)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.customActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearCustomRange}>
                <Text style={styles.clearBtnText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyCustomRange}>
                <Text style={styles.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiChip}>
            <Text style={styles.kpiTitle}>{`Aportes (${rangeLabel})`}</Text>
            <Text style={styles.kpiValue}>{formatCurrency(aportesValue)}</Text>
          </View>
          <View style={styles.kpiChip}>
            <Text style={styles.kpiTitle}>{`Resgates (${rangeLabel})`}</Text>
            <Text style={styles.kpiValue}>{formatCurrency(resgatesValue)}</Text>
          </View>
        </View>

        {/* Próximos + botão adicionar */}
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>Próximos eventos</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NovoEvento' as never)}
            style={styles.addBtn}
            accessibilityLabel="Adicionar novo evento"
          >
            <Ionicons name="add" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Lista com swipe */}
        {upcomingEvents.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-clear-outline" size={18} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhum evento futuro</Text>
          </View>
        ) : (
          upcomingEvents.map((it) => {
            let dateLabel = '--/--';
            try {
              const parts = (it.date || '').split('-').map((p: string) => parseInt(p, 10));
              if (parts.length === 3 && !parts.some((n) => Number.isNaN(n))) {
                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                dateLabel = Number.isNaN(d.getTime())
                  ? (it.date ?? '--/--')
                  : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              } else {
                dateLabel = it.date ?? '--/--';
              }
            } catch {
              dateLabel = it.date ?? '--/--';
            }

            return (
              <SwipeToDeleteRow
                key={it.id}
                onDelete={() => deleteEventById(it.id)}
                confirmMessage={`${it.titulo}\n${dateLabel} ${it.time ?? ''}`}
                height={64}
                accessibilityLabel={`Excluir ${it.titulo}`}
              >
                <TouchableOpacity
                  style={styles.todayItem}
                  onPress={() => navigation.navigate((it.route ?? 'Agenda') as never)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-clear-outline" size={18} color="#111" />
                    <Text style={styles.todayText}>
                      <Text style={{ fontWeight: '700' }}>{dateLabel}</Text>
                      {'  '}
                      {!!it.time && <Text style={{ fontWeight: '700' }}>{it.time}</Text>}
                      {!!it.time && ' — '}
                      {it.titulo}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </SwipeToDeleteRow>
            );
          })
        )}
      </ScrollView>

      {/* Patrimônio flutuante */}
      <View style={styles.floatingSummaryWrapper} pointerEvents="box-none">
        <View style={styles.summaryBoxFloating}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Patrimônio</Text>
            <Text style={styles.summaryValue}>
              {showValues ? formatCurrency(summary?.total) : '••••••••'}
            </Text>
            <Text style={styles.summaryDate}>{formatDate(summary?.updatedAt)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowValues(!showValues)}
            accessibilityLabel={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            <Ionicons name="eye-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** -------------------- ESTILOS -------------------- */
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110, flexGrow: 1 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: '700', color: '#222', maxWidth: '70%' },
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
  clientsText: { fontWeight: '600', fontSize: 13 },

  /** QUICK ACTIONS em grade (quadrados) */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 10,
    marginBottom: 2,
  },
  actionTile: {
    width: '31.5%',         // 3 por linha
    aspectRatio: 1,         // quadrado
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  /** "Mais opções" — discreto */
  moreRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  moreLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moreLinkText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },

  /** Seletor de período */
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  rangeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rangeChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  rangeChipText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  rangeChipTextActive: { color: '#FFFFFF' },

  // Chip “Intervalo”
  rangeChipOutline: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeChipOutlineActive: {
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
  },
  rangeChipOutlineText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  rangeChipOutlineTextActive: { color: '#111827' },

  /** Painel de intervalo customizado */
  customPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginTop: -2,
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  customLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  dateBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  customActions: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F4F6' },
  clearBtnText: { color: '#374151', fontSize: 12, fontWeight: '700' },
  applyBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#111827' },
  applyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  /** KPIs */
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  kpiChip: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  kpiTitle: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  kpiValue: { fontSize: 14, fontWeight: '700', color: '#111' },

  /** Header de próximos */
  todayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  todayTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  /** Lista vazia */
  emptyBox: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  emptyText: { color: '#6B7280', fontSize: 14 },

  /** Swipe row container */
  swipeContainer: { position: 'relative', width: '100%', marginTop: 8, borderRadius: 12 },

  /** UNDERLAY atrás do card */
  underlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  underlayContent: { alignItems: 'center', justifyContent: 'center' },
  underlayText: { color: '#B91C1C', fontWeight: '700', marginTop: 4, fontSize: 12 },

  /** CARD que desliza */
  swipeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  /** Item visual */
  todayItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayText: { color: '#111', fontSize: 14, marginLeft: 8 },

  /** Patrimônio flutuante */
  floatingSummaryWrapper: { position: 'absolute', left: 20, right: 20, bottom: 12 },
  summaryBoxFloating: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#111', marginVertical: 4 },
  summaryDate: { fontSize: 12, color: '#666' },
});
