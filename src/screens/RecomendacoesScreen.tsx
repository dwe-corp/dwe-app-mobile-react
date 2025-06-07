import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function RecomendacoesScreen() {
  const recomendacoes = [
    'Mantenha lanternas acessíveis e com pilhas carregadas.',
    'Economize a bateria de dispositivos eletrônicos.',
    'Estoque água potável e alimentos não perecíveis.',
    'Use rádios a pilha para acompanhar informações locais.',
    'Desligue aparelhos eletrônicos para evitar queima com retorno da energia.',
    'Mantenha geladeiras e freezers fechados para preservar os alimentos.',
    'Evite usar elevadores durante apagões.',
    'Verifique se idosos ou pessoas com necessidades especiais estão seguros.',
    'Carregue power banks com antecedência para manter seus dispositivos funcionando.',
    'Evite abrir a geladeira desnecessariamente para preservar os alimentos por mais tempo.',
    'Tenha um kit de emergência com primeiros socorros, fósforos, velas e ferramentas básicas.',
    'Armazene água para higiene pessoal caso o fornecimento também seja interrompido.',
    'Informe-se previamente sobre os canais oficiais de comunicação e emergência da sua cidade.'
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Boas Práticas em Casos de Falta de Energia</Text>

      <View style={styles.card}>
        {recomendacoes.map((item, idx) => (
          <Text key={idx} style={styles.item}>{item}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    width: '80%'
  },
  item: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22
  },
});
