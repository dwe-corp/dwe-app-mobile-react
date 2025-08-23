import React, { useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Cliente = {
  id: string;
  nome: string;
  patrimonio: number;
  avatar?: string;
};

const MOCK_CLIENTES: Cliente[] = [
  { id: '1', nome: 'Ethan Harper',   patrimonio: 120000,  avatar: 'https://i.pravatar.cc/120?img=12' },
  { id: '2', nome: 'Olivia Bennett', patrimonio:  85000,  avatar: 'https://i.pravatar.cc/120?img=32' },
  { id: '3', nome: 'Noah Carter',    patrimonio: 210000,  avatar: 'https://i.pravatar.cc/120?img=15' },
  { id: '4', nome: 'Ava Mitchell',   patrimonio: 150000,  avatar: 'https://i.pravatar.cc/120?img=47' },
  { id: '5', nome: 'Liam Foster',    patrimonio:  95000,  avatar: 'https://i.pravatar.cc/120?img=25' },
  { id: '6', nome: 'Isabella Reed',  patrimonio: 180000,  avatar: 'https://i.pravatar.cc/120?img=49' },
  { id: '7', nome: 'Jackson Hayes',  patrimonio: 110000,  avatar: 'https://i.pravatar.cc/120?img=5'  },
  { id: '8', nome: 'Sophia Evans',   patrimonio: 140000,  avatar: 'https://i.pravatar.cc/120?img=58' },
];

export default function ClientesScreen() {
  const navigation = useNavigation();
  const clientes = useMemo(() => MOCK_CLIENTES, []);
  const totalClientes = clientes.length;

  const formatBRL = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const getClientsBadgeStyle = (count: number | null) => {
    if (count === null || count === 0) {
      return { bg: '#f0f0f0', border: '#ccc', text: '#888' };
    }
    if (count >= 100) {
      return { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828' };
    }
    if (count >= 50) {
      return { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17' };
    }
    return { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' };
  };

  const badge = getClientsBadgeStyle(totalClientes);

  // ----- Modal estado -----
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const openModal = () => {
    setEmailInput('');
    setEmailError(null);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const onSubmitEmail = () => {
    const e = emailInput.trim();
    if (!validateEmail(e)) {
      setEmailError('Informe um e-mail válido.');
      return;
    }
    console.log('[Clientes] Email enviado para aprovação:', e);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={styles.row}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require('../../assets/avatar.png')
        }
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>
          {item.nome}
        </Text>
        <Text style={styles.valor}>{formatBRL(item.patrimonio)}</Text>
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => {
          console.log('[Clientes] Ver Perfil:', item.id);
          // navigation.navigate('ClienteDetalhe' as never, { id: item.id } as never);
        }}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText}>Ver Perfil</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Animação do botão "+" ---
  const addScale = useRef(new Animated.Value(1)).current;
  const onAddPressIn = () => {
    Animated.spring(addScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };
  const onAddPressOut = () => {
    Animated.spring(addScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };
  const onAddPress = () => openModal();

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top bar: badge centralizada + botão "+" à direita */}
      <View style={styles.topBar}>
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
            Clientes: {totalClientes}
          </Text>
        </View>

        {/* Botão posicionado e animado */}
        <Animated.View style={[styles.addButtonWrapper, { transform: [{ scale: addScale }] }]}>
          <Pressable
            onPressIn={onAddPressIn}
            onPressOut={onAddPressOut}
            onPress={onAddPress}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>

      <FlatList
        data={clientes}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* -------- Modal de e-mail -------- */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%' }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Adicionar Cliente</Text>

                  </View>

                  <Text style={styles.modalLabel}>E-mail do cliente</Text>
                  <TextInput
                    placeholder="nome@exemplo.com"
                    placeholderTextColor="#aaa"
                    value={emailInput}
                    onChangeText={(t) => {
                      setEmailInput(t);
                      if (emailError) setEmailError(null);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, emailError ? styles.inputError : undefined]}
                  />
                  {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnLight} onPress={closeModal}>
                      <Text style={styles.btnLightText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrimary} onPress={onSubmitEmail}>
                      <Text style={styles.btnPrimaryText}>Enviar</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.hint}>
                    O cliente receberá um convite para aprovar o vínculo.
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
    minHeight: 40, // garante área da barra
  },
  clientsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addButtonWrapper: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -17, // metade do botão (34/2) para centralizar verticalmente
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  clientsText: {
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: '#FFE9D6',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  valor: {
    marginTop: 2,
    fontSize: 14,
    color: '#7A8CA5',
    fontWeight: '600',
  },
  cta: {
    backgroundColor: '#EFF1F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ctaText: {
    color: '#3E4A5A',
    fontWeight: '700',
    fontSize: 14,
  },

  // --- Modal / Pop-up ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center', // centraliza o título
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  modalLabel: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#D9534F',
    backgroundColor: '#FFF6F6',
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  btnLight: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  btnLightText: {
    color: '#333',
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});