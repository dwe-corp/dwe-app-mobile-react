
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.68.82:8080';

export const loginUser = async (email: string, senha: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, senha });
    const { token } = response.data;
    await AsyncStorage.setItem('token', token);
    return true;
  } catch (error: any) {
    console.error('Erro no login:', error.response?.data || error.message);
    return false;
  }
};

export const registerUser = async (
  nome: string,
  email: string,
  senha: string,
  perfil: 'INVESTIDOR' | 'ASSESSOR'
): Promise<boolean> => {
  try {
    const payload = { nome, email, senha, perfil };
    console.log('📤 Enviando para /auth:', payload); // debug opcional
    const response = await axios.post(`${API_URL}/auth`, payload);
    return response.status === 201 || response.status === 200;
  } catch (error: any) {
    console.error('Erro no cadastro:', error.response?.data || error.message);
    return false;
  }
};


export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem('token');
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};
