import api from './api';

export const registerUserSuitability = async (
  nome: string,
  email: string,
  respostasConservadoras: number,
  respostasModeradas: number,
  respostasAgressivas: number,
): Promise<{ success: boolean; data?: any }> => {
  try {
    const payload = {
      nome,
      email,
      respostasConservadoras,
      respostasModeradas,
      respostasAgressivas,
    };

    const response = await api.post('http://192.168.0.14:8082/suitability', payload);
    const success = response.status === 201 || response.status === 200;

    return {
      success,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Erro na API de Suitability:', error.response?.data || error.message);
    return {
      success: false,
      data: error.response?.data,
    };
  }
};

export const getUserRiskProfile = async (email: string): Promise<string | null> => {
  try {
    const response = await api.get(`http://192.168.0.14:8082/suitability?email=${email}`);
    console.log('Resposta da API de perfil de risco:', response.data);

    const primeiroCliente = response.data?.[0];
    const risco = primeiroCliente?.risco;

    console.log('Risco extraído:', risco);

    return risco || null;
  } catch (error: any) {
    console.error('Erro ao buscar perfil de risco:', error.response?.data || error.message);
    return null;
  }
};
