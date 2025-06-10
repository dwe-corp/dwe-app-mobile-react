import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!nome.trim()) newErrors.nome = 'O nome é obrigatório.';
    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }
    if (!senha) newErrors.senha = 'A senha é obrigatória.';
    if (!perfil) newErrors.perfil = 'O perfil é obrigatório.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const success = await registerUser(nome, email, senha, perfil as 'INVESTIDOR' | 'ASSESSOR');
    if (success) {
      navigation.goBack();
    } else {
      setErrors({ geral: 'Falha ao cadastrar. Verifique os dados ou tente novamente.' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Criar Conta</Text>

        <TextInput
          style={[styles.input, errors.nome && styles.inputError]}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, errors.senha && styles.inputError]}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        
        <View style={styles.perfilContainer}>
          <TouchableOpacity
            style={[
              styles.perfilButton,
              perfil === 'INVESTIDOR' && styles.perfilButtonSelected
            ]}
            onPress={() => setPerfil('INVESTIDOR')}
          >
            <Text style={perfil === 'INVESTIDOR' ? styles.perfilTextSelected : styles.perfilText}>
              Investidor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.perfilButton,
              perfil === 'ASSESSOR' && styles.perfilButtonSelected
            ]}
            onPress={() => setPerfil('ASSESSOR')}
          >
            <Text style={perfil === 'ASSESSOR' ? styles.perfilTextSelected : styles.perfilText}>
              Assessor
            </Text>
          </TouchableOpacity>
        </View>

        {Object.values(errors).length > 0 && (
          <View style={styles.errorGroupBox}>
            {Object.entries(errors).map(([key, msg]) => (
              <Text key={key} style={styles.errorText}>• {msg}</Text>
            ))}
          </View>
        )}

        <CustomButton title="Cadastrar" onPress={handleRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#cc0000',
    backgroundColor: '#fff6f6',
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '600',
  },
  perfilContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  perfilButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  perfilButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  perfilText: {
    color: '#333',
    fontWeight: '500',
  },
  perfilTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  errorGroupBox: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 13,
    marginBottom: 4,
  }
});
