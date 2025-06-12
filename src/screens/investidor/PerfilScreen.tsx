import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserRiskProfile } from '../../services/suitabilityService';

export default function ProfileScreen() {
  const { userName, userEmail, userProfile, logout } = useAuth();
  const [riskProfile, setRiskProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        const perfilRisco = await getUserRiskProfile(userEmail);
        setRiskProfile(perfilRisco);
      } catch (error) {
        console.log('Erro ao buscar perfil de risco');
        setRiskProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [userEmail, isFocused]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingTitle}>Carregando perfil...</Text>
          <Text style={styles.loadingSubtitle}>Estamos buscando suas informações.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../../assets/avatar.png')}
          style={styles.avatar}
        />

        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.role}>{userProfile}</Text>

        <View style={styles.separator} />

        <View style={styles.optionBox}>
          <Ionicons name="mail-outline" size={20} color="#333" style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Email</Text>
            <Text style={styles.optionValue} numberOfLines={1} ellipsizeMode="tail">
              {userEmail}
            </Text>
          </View>
        </View>

        <View style={styles.optionBox}>
          <Ionicons name="shield-outline" size={20} color="#333" style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Perfil de investidor</Text>
            <Text style={styles.optionValue}>
              {riskProfile ?? 'Perfil não definido'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ConfigConta')}
        >
          <Ionicons name="settings-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.optionText}>Configurações da Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('FormularioCadastro')}
        >
          <Ionicons name="document-text-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.optionText}>Formulário de Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#f2f2f2',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  role: {
    textAlign: 'center',
    fontSize: 14,
    color: '#b5b5b5',
    marginBottom: 24,
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
    width: '100%',
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  optionLabel: {
    color: '#555',
    fontSize: 14,
  },
  optionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FFECEC',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D9534F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  loadingTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
});
