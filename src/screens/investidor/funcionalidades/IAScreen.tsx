import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function IAScreen() {
  const navigation = useNavigation();
  const [promptEnviado, setPromptEnviado] = useState(false);
  const [inputText, setInputText] = useState('');
  const [mensagens, setMensagens] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (inputText.trim() !== '') {
      setPromptEnviado(true);
      setMensagens([...mensagens, inputText]);
      setInputText('');

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Nina</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Conteúdo */}
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            !promptEnviado && { flexGrow: 0 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {!promptEnviado ? (
            <>
              <Text style={styles.description}>
                Durante uma reunião com o cliente, você pode usar o Assistente de IA para acessar rapidamente informações e insights. Aqui estão alguns exemplos de como você pode interagir com o assistente:
              </Text>

              {assistenteExemplos.map((item, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitulo}</Text>
                </View>
              ))}
            </>
          ) : (
            <>
              {mensagens.map((msg, idx) => (
                <Animated.View key={idx} style={[styles.userMessage, { opacity: fadeAnim }]}>
                  <Text style={styles.userText}>{msg}</Text>
                </Animated.View>
              ))}
              <Animated.View style={[styles.botMessage, { opacity: fadeAnim }]}>
                <Text style={styles.botText}>Ok! Já estou analisando isso para você...</Text>
              </Animated.View>
            </>
          )}
        </ScrollView>

        {/* Campo de input com ajuste visual */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputBubble}>
            <TouchableOpacity>
              <Ionicons name="mic-outline" size={20} color="#007AFF" style={{ marginHorizontal: 8 }} />
            </TouchableOpacity>

            <TextInput
              placeholder="Faça uma pergunta ou digite um comando..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              style={styles.input}
              returnKeyType="send"
              placeholderTextColor="#888"
            />

            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={20} color="#007AFF" style={{ marginHorizontal: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const assistenteExemplos = [
  {
    titulo: 'Resumir meu portfólio',
    subtitulo: 'Obtenha uma visão geral rápida do desempenho do seu portfólio.',
  },
  {
    titulo: 'Mostrar tendências atuais do mercado',
    subtitulo: 'Acesse dados e tendências de mercado em tempo real.',
  },
  {
    titulo: 'Analisar investimento em ações de tecnologia',
    subtitulo: 'Forneça insights sobre opções específicas de investimento.',
  },
  {
    titulo: 'Sugerir novas estratégias de investimento',
    subtitulo: 'Gere recomendações de investimento personalizadas.',
  },
  {
    titulo: 'Explicar riscos de investimentos em cripto',
    subtitulo: 'Responda perguntas do cliente sobre riscos de investimento.',
  },
];

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 24,
    marginTop: 24,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  inputWrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 6,
    color: '#000',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userText: {
    color: '#fff',
    fontSize: 14,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEDED',
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
    maxWidth: '80%',
  },
  botText: {
    color: '#333',
    fontSize: 14,
  },
});
