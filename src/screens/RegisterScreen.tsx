import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { registerUser } from '../services/authService';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<'INVESTIDOR' | 'ASSESSOR'>('INVESTIDOR');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!nome.trim()) newErrors.nome = 'O nome é obrigatório.';
    if (!email.includes('@')) newErrors.email = 'Formato de e-mail inválido.';
    if (!senha) newErrors.senha = 'A senha é obrigatória.';
    if (!perfil) newErrors.perfil = 'O perfil é obrigatório.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const success = await registerUser(nome, email, senha, perfil);
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
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />
        {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        {errors.senha && <Text style={styles.error}>{errors.senha}</Text>}

        <Text style={styles.label}>Perfil</Text>
        <Picker
          selectedValue={perfil}
          style={styles.input}
          onValueChange={(itemValue) => setPerfil(itemValue)}
        >
          <Picker.Item label="Investidor" value="INVESTIDOR" />
          <Picker.Item label="Assessor" value="ASSESSOR" />
        </Picker>
        {errors.perfil && <Text style={styles.error}>{errors.perfil}</Text>}

        {errors.geral && <Text style={styles.error}>{errors.geral}</Text>}

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
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'left',
  },
});
