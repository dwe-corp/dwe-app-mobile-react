// services/authService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.14:8080';

type Perfil = 'INVESTIDOR' | 'ASSESSOR';

type LoginApiResp = {
  token?: string;
  perfil?: Perfil;
  nome?: string;
  email?: string;
};

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  dataCriacao?: string;
};

export async function loginUser(
  email: string,
  senha: string
): Promise<{ success: boolean; token?: string; perfil?: Perfil; nome?: string; email?: string }> {
  try {
    // 1) LOGIN
    const { data } = await axios.post<LoginApiResp>(`${API_URL}/login`, { email, senha });
    const token  = data?.token ?? null;
    const perfil = data?.perfil ?? null;
    if (!token || !perfil) {
      return { success: false };
    }

    // 2) NORMALIZA NOME/EMAIL
    let nomeFinal  = data?.nome  ?? null;
    let emailFinal = data?.email ?? email ?? null;

    // 3) SE FALTAR NOME, BUSCA NO /auth (de preferência com filtro por email)
    if (!nomeFinal) {
      try {
        const resp = await axios.get<Usuario[] | Usuario>(`${API_URL}/auth`, { params: { email: emailFinal } });
        const list = Array.isArray(resp.data) ? resp.data : [resp.data];
        // se a API ignorar o filtro, tentamos achar pelo email; senão pega o primeiro
        const found = list.find(u => u.email === emailFinal) ?? list[0];
        if (found) {
          nomeFinal = found.nome ?? nomeFinal;
          // Se quiser sincronizar perfil com o cadastro, poderia fazer:
          // perfil = found.perfil ?? perfil;
        }
      } catch {
        // segue com o que temos
      }
    }

    // 4) PERSISTE TUDO DO JEITO QUE O AuthContext ESPERA
    await AsyncStorage.multiSet([
      ['token', token],
      ['profile', perfil],
      ['nome', nomeFinal ?? ''],
      ['email', emailFinal ?? ''],
    ]);

    return { success: true, token, perfil, nome: nomeFinal ?? '', email: emailFinal ?? '' };
  } catch (error: any) {
    console.log('[loginUser] erro:', error?.response?.data || error.message);
    return { success: false };
  }
}

export const registerUser = async (
  nome: string,
  email: string,
  senha: string,
  perfil: Perfil
): Promise<boolean> => {
  try {
    const payload = { nome, email, senha, perfil };
    const response = await axios.post(`${API_URL}/auth`, payload);
    return response.status === 201 || response.status === 200;
  } catch (error: any) {
    console.log('Erro no cadastro:', error.response?.data || error.message);
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem('token');
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};