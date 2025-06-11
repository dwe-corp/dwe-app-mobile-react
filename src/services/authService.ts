
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.14:8080';

export async function loginUser(email: string, senha: string): Promise<{ success: boolean, perfil?: 'INVESTIDOR' | 'ASSESSOR', nome?: string, email?: string }> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, senha });
    console.log('Resposta da API:', response.data);

    const { token, perfil, nome, email: userEmail } = response.data;

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('profile', perfil);
    
    return  { success: true, perfil, nome, email: userEmail };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error?.response?.data || error.message);
    return { success: false };
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
    console.log('📤 Enviando para /auth:', payload);
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
