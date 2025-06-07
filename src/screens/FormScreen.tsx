import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { saveData, loadData } from '../services/storageService';
import { EventoApagao } from '../types';
import { v4 as uuidv4 } from 'uuid';
import CustomButton from '../components/CustomButton';

export default function FormScreen({ navigation }) {
  const [localizacao, setLocalizacao] = useState('');
  const [tempo, setTempo] = useState('');
  const [prejuizos, setPrejuizos] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');

  const handleSubmit = async () => {
    const novoEvento: EventoApagao = {
      id: uuidv4(),
      localizacao,
      tempoInterrupcao: tempo,
      prejuizos,
      recomendacoes,
      data: new Date().toLocaleDateString()
    };

    const eventos = await loadData('eventos') || [];
    eventos.push(novoEvento);
    await saveData('eventos', eventos);

    window.alert('Evento salvo com sucesso!');
    navigation.reset({ index: 0, routes: [{ name: 'Apagão Cidadão' }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Localização Afetada:</Text>
        <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Bairro Liberdade, São Paulo"/>

        <Text style={styles.label}>Tempo de Interrupção:</Text>
        <TextInput style={styles.input} value={tempo} onChangeText={setTempo} placeholder="Ex: 2 horas e 30 minutos"/>

        <Text style={styles.label}>Prejuízo(s) Causado(s):</Text>
        <TextInput style={styles.input} multiline numberOfLines={4} value={prejuizos} onChangeText={setPrejuizos} placeholder="Ex: Alimentos estragados, Perda de vendas, etc."/>

        <CustomButton title="Salvar Evento" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
