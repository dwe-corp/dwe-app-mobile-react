import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EventoApagao } from '../types';

export default function DetailsScreen({ route }) {
  const evento: EventoApagao = route.params.evento;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalhes do Evento</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Localização:</Text>
        <Text style={styles.value}>{evento.localizacao}</Text>

        <Text style={styles.label}>Tempo sem energia:</Text>
        <Text style={styles.value}>{evento.tempoInterrupcao}</Text>

        <Text style={styles.label}>Prejuízo(s):</Text>
        <Text style={styles.value}>{evento.prejuizos}</Text>

        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{evento.data}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    width: '80%',
    alignSelf: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  value: {
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
});
