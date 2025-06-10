import api from './api';

export const registerUserSuitability = async (
  respostasConservadoras: number,
  respostasModeradas: number,
  respostasAgressivas: number,
): Promise<{ success: boolean; data?: any }> => {
  try {
    const payload = {
      respostasConservadoras,
      respostasModeradas,
      respostasAgressivas,
    };

    const response = await api.post('http://localhost:8082/suitability', payload);
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
