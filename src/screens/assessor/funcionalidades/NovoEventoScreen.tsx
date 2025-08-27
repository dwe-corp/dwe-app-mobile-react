import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { AndroidEvent } from '@react-native-community/datetimepicker';

type EventoForm = {
  titulo: string;
  data: string;
  hora: string;
  cliente?: string;
  tipo: 'Reunião' | 'Ligação' | 'Outro';
  lembreteMin?: string;
  notas?: string;
};

const COLORS = {
  bg: '#F3F4F6',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#2563EB',
  placeholder: '#9CA3AF',
  // padrão de erro (mesmo do Login)
  errorBorder: '#cc0000',
  errorBg: '#fff6f6',
  errorBoxBg: '#ffe6e6',
  errorBoxBorder: '#ffcccc',
  errorText: '#cc0000',
};

const PLACEHOLDER = '#B9C0CC';
const FIELD_HEIGHT = 52;

export default function NovoEventoScreen() {
  const navigation = useNavigation();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventoForm>({
    titulo: '',
    data: '',
    hora: '',
    cliente: '',
    tipo: 'Reunião',
    lembreteMin: '',
    notas: '',
  });

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [focus, setFocus] = useState<{ [k in keyof EventoForm]?: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const canSave = useMemo(
    () => form.titulo.trim() && form.data.trim() && form.hora.trim(),
    [form]
  );

  const update = <K extends keyof EventoForm>(key: K, value: EventoForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ------- helpers -------
  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const formatTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  const isValidDateFormat = (s: string) => /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.test(s);
  const isLogicalDate = (s: string) => {
    if (!isValidDateFormat(s)) return false;
    const [dd, mm, yyyy] = s.split('/').map(Number);
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  };
  const isValidTime = (s: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);

  // máscaras manuais (para WEB/Safari)
  const maskDate = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const p1 = digits.slice(0, 2);
    const p2 = digits.slice(2, 4);
    const p3 = digits.slice(4, 8);
    if (digits.length <= 2) return p1;
    if (digits.length <= 4) return `${p1}/${p2}`;
    return `${p1}/${p2}/${p3}`;
  };
  const maskTime = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    const p1 = digits.slice(0, 2);
    const p2 = digits.slice(2, 4);
    if (digits.length <= 2) return p1;
    return `${p1}:${p2}`;
  };

  // ------- pickers -------
  const onChangeDate = (event: AndroidEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        update('data', formatDate(selected));
        if (!form.hora) update('hora', formatTime(selected));
      }
      setShowDate(false);
    } else {
      if (selected) setTempDate(selected);
    }
  };
  const onConfirmDateIOS = () => {
    update('data', formatDate(tempDate));
    if (!form.hora) update('hora', formatTime(tempDate));
    setShowDate(false);
  };

  const onChangeTime = (event: AndroidEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        update('hora', formatTime(selected));
      }
      setShowTime(false);
    } else {
      if (selected) setTempDate(selected);
    }
  };
  const onConfirmTimeIOS = () => {
    update('hora', formatTime(tempDate));
    setShowTime(false);
  };

  const handleSave = async () => {
    const nextErrors: { [k: string]: string } = {};

    if (!form.titulo.trim()) nextErrors.titulo = 'O título é obrigatório.';
    if (!form.data.trim()) nextErrors.data = 'A data é obrigatória.';
    else if (!isLogicalDate(form.data)) nextErrors.data = 'Data inválida (use DD/MM/AAAA).';
    if (!form.hora.trim()) nextErrors.hora = 'O horário é obrigatório.';
    else if (!isValidTime(form.hora)) nextErrors.hora = 'Horário inválido (use HH:MM).';

    if (form.lembreteMin && !/^\d+$/.test(form.lembreteMin)) {
      nextErrors.lembreteMin = 'Informe apenas números em minutos.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      setSaving(true);
      const [dd, mm, yyyy] = form.data.split('/');
      const eventDate = `${yyyy}-${mm}-${dd}`;
      const eventTime = form.hora;

      const newEvent = {
        id: `${Date.now()}`,
        titulo: form.titulo.trim(),
        date: eventDate,
        time: eventTime,
        cliente: form.cliente?.trim() || '',
        tipo: form.tipo,
        lembreteMin: form.lembreteMin || '',
        notas: form.notas || '',
        createdAt: new Date().toISOString(),
      };

      const raw = await AsyncStorage.getItem('@events');
      const list = raw ? JSON.parse(raw) : [];
      list.push(newEvent);
      await AsyncStorage.setItem('@events', JSON.stringify(list));

      Alert.alert('Evento criado', 'Seu evento foi adicionado com sucesso.');
      // @ts-ignore
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o evento.');
    } finally {
      setSaving(false);
    }
  };

  // ------- wrappers -------
  const InputRow: React.FC<{
    error?: boolean;
    focused?: boolean;
    children: React.ReactNode;
  }> = ({ error, focused, children }) => (
    <View
      pointerEvents="box-none"
      style={[
        styles.inputRow,
        focused && styles.inputRowFocus,
        error && styles.inputRowError,
      ]}
    >
      {children}
    </View>
  );

  const RightIcon: React.FC<{ name: any; error?: boolean }> = ({ name, error }) => (
    <Ionicons
      name={name}
      size={18}
      color={error ? COLORS.errorBorder : COLORS.placeholder}
      style={styles.rightIcon}
      pointerEvents="none"
    />
  );

  // ------- fields -------
  const renderDateField = () => {
    const hasError = !!errors.data;

    if (Platform.OS === 'web') {
      // Web: editável com máscara
      return (
        <InputRow error={hasError} focused={!!focus.data}>
          <TextInput
            style={styles.inputBase}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={PLACEHOLDER}
            keyboardType="numeric"
            value={form.data}
            onChangeText={(t) => update('data', maskDate(t))}
            onFocus={() => setFocus((f) => ({ ...f, data: true }))}
            onBlur={() => setFocus((f) => ({ ...f, data: false }))}
            inputMode="numeric"
            blurOnSubmit={false}
          />
          <RightIcon name="calendar-outline" error={hasError} />
        </InputRow>
      );
    }

    // Mobile (abre o picker)
    return (
      <TouchableOpacity onPress={() => { setTempDate(new Date()); setShowDate(true); }} activeOpacity={0.9}>
        <InputRow error={hasError}>
          <Text style={[styles.inputValue, !form.data && { color: PLACEHOLDER }]}>
            {form.data || 'DD/MM/AAAA'}
          </Text>
          <RightIcon name="calendar-outline" error={hasError} />
        </InputRow>
      </TouchableOpacity>
    );
  };

  const renderTimeField = () => {
    const hasError = !!errors.hora;

    if (Platform.OS === 'web') {
      // Web: editável com máscara
      return (
        <InputRow error={hasError} focused={!!focus.hora}>
          <TextInput
            style={styles.inputBase}
            placeholder="HH:MM"
            placeholderTextColor={PLACEHOLDER}
            keyboardType="numeric"
            value={form.hora}
            onChangeText={(t) => update('hora', maskTime(t))}
            onFocus={() => setFocus((f) => ({ ...f, hora: true }))}
            onBlur={() => setFocus((f) => ({ ...f, hora: false }))}
            inputMode="numeric"
            blurOnSubmit={false}
          />
          <RightIcon name="time-outline" error={hasError} />
        </InputRow>
      );
    }

    // Mobile (abre o picker)
    return (
      <TouchableOpacity onPress={() => { setTempDate(new Date()); setShowTime(true); }} activeOpacity={0.9}>
        <InputRow error={hasError}>
          <Text style={[styles.inputValue, !form.hora && { color: PLACEHOLDER }]}>
            {form.hora || 'HH:MM'}
          </Text>
          <RightIcon name="time-outline" error={hasError} />
        </InputRow>
      </TouchableOpacity>
    );
  };

  const onAjuda = () =>
    Alert.alert(
      'Ajuda',
      'Preencha os campos do formulário para adicionar um novo evento ao seu calendário. Campos com * são obrigatórios.',
      [{ text: 'Entendi', style: 'default' }]
    );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
          keyboardDismissMode="interactive"
          // ^ Em iOS mantém o gesto suave de fechar teclado sem “roubar” o primeiro toque
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.header}>Adicionar ao Calendário</Text>
            <TouchableOpacity onPress={onAjuda} style={{ padding: 6 }}>
              <Ionicons name="help-circle-outline" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Título */}
            <Text style={styles.label}>Título *</Text>
            <InputRow error={!!errors.titulo} focused={!!focus.titulo}>
              <TextInput
                style={styles.inputBase}
                placeholder="Ex.: Call com João"
                placeholderTextColor={PLACEHOLDER}
                value={form.titulo}
                onChangeText={(t) => update('titulo', t)}
                onFocus={() => setFocus((f) => ({ ...f, titulo: true }))}
                onBlur={() => setFocus((f) => ({ ...f, titulo: false }))}
                maxLength={80}
                blurOnSubmit={false}
              />
              <RightIcon name="chatbubbles-outline" error={!!errors.titulo} />
            </InputRow>

            {/* Data / Hora */}
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <Text style={styles.label}>Data *</Text>
                {renderDateField()}
              </View>
              <View style={[styles.col, { marginLeft: 8 }]}>
                <Text style={styles.label}>Hora *</Text>
                {renderTimeField()}
              </View>
            </View>

            {/* Cliente */}
            <Text style={styles.label}>Cliente (opcional)</Text>
            <InputRow focused={!!focus.cliente}>
              <TextInput
                style={styles.inputBase}
                placeholder="Nome do cliente"
                placeholderTextColor={PLACEHOLDER}
                value={form.cliente}
                onChangeText={(t) => update('cliente', t)}
                onFocus={() => setFocus((f) => ({ ...f, cliente: true }))}
                onBlur={() => setFocus((f) => ({ ...f, cliente: false }))}
                blurOnSubmit={false}
              />
              <RightIcon name="person-circle-outline" />
            </InputRow>

            {/* Tipo */}
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.pillsRow}>
              {(['Reunião', 'Ligação', 'Outro'] as const).map((opt) => {
                const active = form.tipo === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => update('tipo', opt)}
                    style={[styles.pill, active && styles.pillActive]}
                    accessibilityLabel={`Selecionar tipo ${opt}`}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Lembrete */}
            <Text style={styles.label}>Lembrete (minutos antes)</Text>
            <InputRow error={!!errors.lembreteMin} focused={!!focus.lembreteMin}>
              <TextInput
                style={styles.inputBase}
                placeholder="Ex.: 15"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="number-pad"
                value={form.lembreteMin}
                onChangeText={(t) => update('lembreteMin', t.replace(/\D+/g, ''))}
                onFocus={() => setFocus((f) => ({ ...f, lembreteMin: true }))}
                onBlur={() => setFocus((f) => ({ ...f, lembreteMin: false }))}
                blurOnSubmit={false}
              />
              <RightIcon name="notifications-outline" error={!!errors.lembreteMin} />
            </InputRow>

            {/* Notas */}
            <Text style={styles.label}>Notas</Text>
            <View style={styles.textareaWrapper}>
              <TextInput
                style={[styles.inputBase, { height: 110, textAlignVertical: 'top' }]}
                placeholder="Informações adicionais, pauta, objetivos…"
                placeholderTextColor={PLACEHOLDER}
                multiline
                value={form.notas}
                onChangeText={(t) => update('notas', t)}
                onFocus={() => setFocus((f) => ({ ...f, notas: true }))}
                onBlur={() => setFocus((f) => ({ ...f, notas: false }))}
                blurOnSubmit={false}
              />
            </View>

            {/* Caixa de erros */}
            {Object.values(errors).length > 0 && (
              <View style={styles.errorBox} accessibilityRole="alert">
                {Object.entries(errors).map(([key, msg]) => (
                  <Text key={key} style={styles.errorText}>• {msg}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
              <Ionicons name="close-outline" size={18} color={COLORS.text} />
              <Text style={[styles.btnText, styles.btnTextGhost]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, !canSave || saving ? styles.btnDisabled : styles.btnPrimary]}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={[styles.btnText, { color: '#fff', marginLeft: 6 }]}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker - Modal centralizado */}
      <Modal visible={Platform.OS !== 'web' && showDate} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setShowDate(false)}>
          <View style={styles.pickerOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.pickerCenterWrap}>
          <View style={styles.pickerCardCentered}>
            <Text style={styles.pickerTitle}>Selecionar data</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="light"
              onChange={onChangeDate}
              style={{ height: 240 }}
              locale="pt-BR"
            />
            {Platform.OS === 'ios' ? (
              <View style={styles.pickerActions}>
                <TouchableOpacity style={[styles.pSmall, styles.pGhost]} onPress={() => setShowDate(false)}>
                  <Text style={styles.pGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pSmall, styles.pPrimary]} onPress={onConfirmDateIOS}>
                  <Text style={styles.pPrimaryText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Time Picker - Modal centralizado */}
      <Modal visible={Platform.OS !== 'web' && showTime} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setShowTime(false)}>
          <View style={styles.pickerOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.pickerCenterWrap}>
          <View style={styles.pickerCardCentered}>
            <Text style={styles.pickerTitle}>Selecionar horário</Text>
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="light"
              onChange={onChangeTime}
              style={{ height: 240 }}
              locale="pt-BR"
            />
            {Platform.OS === 'ios' ? (
              <View style={styles.pickerActions}>
                <TouchableOpacity style={[styles.pSmall, styles.pGhost]} onPress={() => setShowTime(false)}>
                  <Text style={styles.pGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pSmall, styles.pPrimary]} onPress={onConfirmTimeIOS}>
                  <Text style={styles.pPrimaryText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },

  backBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { marginTop: 2, fontSize: 13, color: COLORS.subtext },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },

  label: { fontSize: 12, color: COLORS.subtext, marginTop: 14, marginBottom: 6, fontWeight: '600' },

  // —— Altura padronizada de todos os campos ——
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: FIELD_HEIGHT,
  },
  inputRowFocus: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  inputRowError: { borderColor: COLORS.errorBorder, backgroundColor: COLORS.errorBg },

  inputBase: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    // Evita conflitos de clique/caret: não force altura rígida do TextInput.
    // O container (inputRow) já define a altura, então basta remover height aqui.
    paddingVertical: 0,
    marginRight: 8,
    ...(Platform.OS === 'web' ? {} : { /* nada específico no web */ }),
  },
  inputValue: { flex: 1, fontSize: 14, color: COLORS.text },
  rightIcon: { marginLeft: 8 },

  textareaWrapper: {
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#F9FAFB',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
  },

  // Pills
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  pillActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  pillText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  pillTextActive: { color: '#1E293B' },

  // Erros
  errorBox: {
    backgroundColor: COLORS.errorBoxBg,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.errorBoxBorder,
  },
  errorText: { color: COLORS.errorText, fontSize: 13, marginBottom: 4, fontWeight: '600' },

  // Ações
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 12 },
  btnText: { fontSize: 15, fontWeight: '800' },
  btnTextGhost: { color: COLORS.text, marginLeft: 6 },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnDisabled: { backgroundColor: '#A3A3A3' },
  btnGhost: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },

  // ===== MODAL picker (novo, centralizado) =====
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  pickerCenterWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerCardCentered: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  pickerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },

  // —— estilos antigos do sheet (mantidos caso queira reverter) ——
  pickerCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 14,
  },
  pickerTitleOld: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8, paddingHorizontal: 4 },
  pSmall: { height: 38, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pGhost: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  pGhostText: { color: COLORS.text, fontWeight: '800' },
  pPrimary: { backgroundColor: COLORS.primary },
  pPrimaryText: { color: '#fff', fontWeight: '800' },

  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  header: { fontSize: 20, fontWeight: '700', color: '#222', textAlign: 'center', flex: 1 },
});