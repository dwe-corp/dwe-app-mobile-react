import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login } = useAuth();

  const handleLogin = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }

    if (!senha.trim()) {
      newErrors.senha = 'A senha é obrigatória.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = await loginUser(email, senha);
    if (result.success && result.perfil) {
      login(result.perfil, result.nome, result.email);
    } else {
      setErrors({ geral: 'Credenciais inválidas ou perfil não encontrado.' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Bem-Vindo</Text>

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="E-mail"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, errors.senha && styles.inputError]}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* {<TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkRight}>Esqueceu a senha?</Text>
        </TouchableOpacity>} */}

        {Object.values(errors).length > 0 && (
          <View style={styles.errorBox}>
            {Object.entries(errors).map(([key, msg]) => (
              <Text key={key} style={styles.errorText}>• {msg}</Text>
            ))}
          </View>
        )}

        <CustomButton title="Entrar" onPress={handleLogin} />

        <View style={styles.bottomLinkContainer}>
          <Text style={styles.linkBottom}>
            Primeira vez por aqui?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkHighlight}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2'
  },
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
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
  linkRight: {
    alignSelf: 'flex-end',
    color: '#007bff',
    fontSize: 13,
    marginBottom: 12,
  },
  bottomLinkContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkBottom: {
    fontSize: 14,
    color: '#666',
  },
  linkHighlight: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  errorBox: {
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
