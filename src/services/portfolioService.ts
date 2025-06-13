import api from './api';

interface PortfolioSummary {
  total?: number;
  updatedAt?: string;
}

export const getPortfolioSummary = async (email: string): Promise<PortfolioSummary | null> => {
  try {
    const response = await api.get(`http://192.168.0.14:8083/portfolio?email=${email}`);
    console.log('Resumo do portfólio recebido:', response.data);

    const primeiroRegistro = response.data?.[0];

    if (!primeiroRegistro) return null;

    return {
      total: primeiroRegistro.total,
      updatedAt: primeiroRegistro.updatedAt,
    };
  } catch (error: any) {
    console.log('Erro ao buscar resumo do portfólio:', error.response?.data || error.message);
    return null;
  }
};
