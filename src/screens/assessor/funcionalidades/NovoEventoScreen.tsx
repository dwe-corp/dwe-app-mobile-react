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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EventoForm = {
  titulo: string;
  data: string;   // DD/MM/AAAA
  hora: string;   // HH:MM
  cliente?: string;
  tipo: 'Reunião' | 'Ligação' | 'Outro';
  lembreteMin?: string;
  notas?: string;
};

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

  const canSave = useMemo(
    () => form.titulo.trim() && form.data.trim() && form.hora.trim(),
    [form]
  );

  const update = <K extends keyof EventoForm>(key: K, value: EventoForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Campos obrigatórios', 'Preencha Título, Data e Hora.');
      return;
    }
    try {
      setSaving(true);

      // Normaliza data: DD/MM/AAAA -> YYYY-MM-DD
      const [dd, mm, yyyy] = form.data.split('/');
      const eventDate = `${yyyy}-${mm?.padStart(2, '0')}-${dd?.padStart(2, '0')}`;
      const eventTime = form.hora.padStart(5, '0');

      const newEvent = {
        id: `${Date.now()}`,
        titulo: form.titulo.trim(),
        date: eventDate,   // YYYY-MM-DD
        time: eventTime,   // HH:MM
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
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o evento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Novo Evento</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Call com João"
              value={form.titulo}
              onChangeText={(t) => update('titulo', t)}
              maxLength={80}
            />

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <Text style={styles.label}>Data *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  keyboardType="number-pad"
                  value={form.data}
                  onChangeText={(t) => update('data', t)}
                />
              </View>
              <View style={[styles.col, { marginLeft: 8 }]}>
                <Text style={styles.label}>Hora *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  keyboardType="number-pad"
                  value={form.hora}
                  onChangeText={(t) => update('hora', t)}
                />
              </View>
            </View>

            <Text style={styles.label}>Cliente (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              value={form.cliente}
              onChangeText={(t) => update('cliente', t)}
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeRow}>
              {(['Reunião', 'Ligação', 'Outro'] as const).map((opt) => {
                const active = form.tipo === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.typePill, active && styles.typePillActive]}
                    onPress={() => update('tipo', opt)}
                    accessibilityLabel={`Selecionar tipo ${opt}`}
                  >
                    <Text style={[styles.typePillText, active && styles.typePillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Lembrete (minutos antes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 30"
              keyboardType="number-pad"
              value={form.lembreteMin}
              onChangeText={(t) => update('lembreteMin', t)}
            />

            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.input, { height: 96, textAlignVertical: 'top' }]}
              placeholder="Informações adicionais, pauta, objetivos…"
              multiline
              value={form.notas}
              onChangeText={(t) => update('notas', t)}
            />
          </View>

          {/* Ações */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
              <Text style={[styles.btnText, styles.btnTextGhost]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, !canSave || saving ? styles.btnDisabled : styles.btnPrimary]}
              onPress={handleSave}
              disabled={!canSave || saving}
            >
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={[styles.btnText, { color: '#fff', marginLeft: 8 }]}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  iconBtn: {
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  label: { fontSize: 13, color: '#6B7280', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1 },

  typeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typePillActive: { backgroundColor: '#E0E7FF', borderColor: '#A5B4FC' },
  typePillText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  typePillTextActive: { color: '#1F2937' },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  btnGhost: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  btnTextGhost: { color: '#111' },
  btnPrimary: { backgroundColor: '#007AFF' },
  btnDisabled: { backgroundColor: '#9CA3AF' },
});
