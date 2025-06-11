import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUserSuitability } from '../../../services/suitabilityService';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilInvestidorScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const { userName, userEmail } = useAuth();

  const [respostas, setRespostas] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [erros, setErros] = useState({});

  const perguntas = [
    {
      titulo: '1. Qual é seu principal objetivo com os investimentos?',
      opcoes: [
        'A) Preservar meu capital com segurança.',
        'B) Obter rendimentos regulares e moderados.',
        'C) Maximizar ganhos, aceitando riscos maiores.',
      ],
    },
    {
      titulo: '2. Qual seu nível de conhecimento sobre investimentos?',
      opcoes: [
        'A) Nenhum ou muito básico.',
        'B) Intermediário.',
        'C) Avançado ou profissional.',
      ],
    },
    {
      titulo: '3. Qual seu horizonte de investimento?',
      opcoes: [
        'A) Curto prazo (até 1 ano).',
        'B) Médio prazo (1 a 5 anos).',
        'C) Longo prazo (mais de 5 anos).',
      ],
    },
    {
      titulo: '4. Você já investiu em ações ou fundos de ações?',
      opcoes: [
        'A) Nunca.',
        'B) Sim, mas com valores pequenos.',
        'C) Sim, com frequência e valores relevantes.',
      ],
    },
    {
      titulo: '5. Qual a sua idade?',
      opcoes: [
        'A) Acima de 60 anos.',
        'B) Entre 36 e 59 anos.',
        'C) Até 35 anos.',
      ],
    },
    {
      titulo: '6. Qual é a sua principal fonte de renda?',
      opcoes: [
        'A) Salário fixo.',
        'B) Renda variável com certa estabilidade.',
        'C) Empreendimentos ou renda variável instável.',
      ],
    },
    {
      titulo: '7. Qual é a sua renda mensal média?',
      opcoes: [
        'A) Até R$5.000.',
        'B) De R$5.000 a R$15.000.',
        'C) Acima de R$15.000.',
      ],
    },
    {
      titulo: '8. Qual o percentual da sua renda que pode ser investido?',
      opcoes: [
        'A) Até 10%.',
        'B) Entre 10% e 30%.',
        'C) Mais de 30%.',
      ],
    },
    {
      titulo: '9. Possui reserva de emergência (3 a 6 meses de despesas)?',
      opcoes: [
        'A) Não.',
        'B) Parcialmente.',
        'C) Sim.',
      ],
    },
    {
      titulo: '10. Como você reagiria se seus investimentos caíssem 10% em uma semana?',
      opcoes: [
        'A) Venderia tudo imediatamente.',
        'B) Aguardaria para entender o cenário.',
        'C) Veria como oportunidade para comprar mais.',
      ],
    },
    {
      titulo: '11. Você já investiu em fundos multimercado ou cambiais?',
      opcoes: [
        'A) Não.',
        'B) Sim, mas com receio.',
        'C) Sim, sem problemas.',
      ],
    },
    {
      titulo: '12. Já teve perdas superiores a 10% em investimentos?',
      opcoes: [
        'A) Não e não estou disposto a correr esse risco.',
        'B) Sim, mas fiquei desconfortável.',
        'C) Sim, e considero parte do processo.',
      ],
    },
    {
      titulo: '13. Qual a composição ideal de sua carteira?',
      opcoes: [
        'A) 100% renda fixa.',
        'B) Maioria renda fixa com pequena parte variável.',
        'C) Diversificada com significativa parte em renda variável.',
      ],
    },
    {
      titulo: '14. Como você descreveria sua experiência com investimentos?',
      opcoes: [
        'A) Nenhuma.',
        'B) Alguma experiência.',
        'C) Experiente.',
      ],
    },
    {
      titulo: '15. Você entende o que são produtos como COE, FIDC ou Debêntures?',
      opcoes: [
        'A) Não conheço.',
        'B) Já ouvi falar.',
        'C) Sim, conheço e já investi.',
      ],
    },
    {
      titulo: '16. Com que frequência você acompanha seus investimentos?',
      opcoes: [
        'A) Raramente.',
        'B) Mensalmente.',
        'C) Diariamente ou semanalmente.',
      ],
    },
    {
      titulo: '17. Você já investiu em produtos internacionais?',
      opcoes: [
        'A) Nunca.',
        'B) Tenho interesse, mas não investi ainda.',
        'C) Sim.',
      ],
    },
    {
      titulo: '18. Você tem dívidas em aberto?',
      opcoes: [
        'A) Sim.',
        'B) Algumas, mas controladas.',
        'C) Não.',
      ],
    },
    {
      titulo: '19. Você se considera emocional ao lidar com dinheiro?',
      opcoes: [
        'A) Sim, muito.',
        'B) Um pouco.',
        'C) Não, sou racional.',
      ],
    },
    {
      titulo: '20. Em uma crise de mercado, qual seria sua reação?',
      opcoes: [
        'A) Resgatar tudo para evitar mais perdas.',
        'B) Esperar até os mercados estabilizarem.',
        'C) Aproveitar para investir mais.',
      ],
    },
  ];

  const perguntasPorPagina = 5;
  const inicio = paginaAtual * perguntasPorPagina;
  const fim = inicio + perguntasPorPagina;
  const paginaFinal = fim >= perguntas.length;

  const handleSelecionar = (index, opcao) => {
    const chave = opcao.charAt(0);
    setRespostas({ ...respostas, [index]: chave });
    setErros({ ...erros, [index]: false });
  };

  const handleAvancar = async () => {
    const perguntasPaginaAtual = perguntas.slice(inicio, fim);
    const todasRespondidas = perguntasPaginaAtual.every((_, i) => respostas[inicio + i]);

    if (!todasRespondidas) {
      const novasErros = {};
      perguntasPaginaAtual.forEach((_, i) => {
        if (!respostas[inicio + i]) {
          novasErros[inicio + i] = true;
        }
      });
      setErros(novasErros);
      Alert.alert('Atenção', 'Por favor, responda todas as perguntas antes de continuar.');
      return;
    }

    if (paginaFinal) {
      try {
        const contagem = { A: 0, B: 0, C: 0 };
        Object.values(respostas).forEach(resposta => {
          if (resposta === 'A') contagem.A++;
          if (resposta === 'B') contagem.B++;
          if (resposta === 'C') contagem.C++;
        });

        if (!userName || !userEmail) {
          Alert.alert('Erro', 'E-mail do usuário não encontrado. Faça login novamente.');
          return;
        }

        const resultado = await registerUserSuitability(
          userName,
          userEmail,
          contagem.A,
          contagem.B,
          contagem.C
        );

        if (resultado.success) {
          Alert.alert('Sucesso', 'Seu perfil foi registrado com sucesso!');
          navigation.navigate('Home');
        } else {
          Alert.alert('Erro', 'Não foi possível registrar seu perfil. Tente novamente.');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Erro', 'Erro ao enviar dados. Verifique sua conexão.');
      }
    } else {
      setPaginaAtual(paginaAtual + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleVoltar = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      {paginaAtual === 0 && (
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      )}

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content}>
        {perguntas.slice(inicio, fim).map((pergunta, index) => {
          const perguntaIndex = inicio + index;
          return (
            <View
              key={perguntaIndex}
              style={[styles.perguntaContainer, erros[perguntaIndex] && styles.perguntaErro]}
            >
              <Text style={styles.perguntaTitulo}>{pergunta.titulo}</Text>
              {pergunta.opcoes.map((opcao, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.opcaoButton,
                    respostas[perguntaIndex] === opcao.charAt(0) && styles.opcaoSelecionada]}
                  onPress={() => handleSelecionar(perguntaIndex, opcao)}
                >
                  <Text style={[styles.opcaoTexto,
                    respostas[perguntaIndex] === opcao.charAt(0) && styles.opcaoTextoSelecionado]}
                  >
                    {opcao}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <View style={[styles.footerButtons,{ justifyContent: paginaAtual > 0 ? 'space-between' : 'flex-end' }]}>
          {paginaAtual > 0 && (
            <TouchableOpacity style={styles.navButtonCinza} onPress={handleVoltar}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.navButtonAzul} onPress={handleAvancar}>
            <Ionicons name={paginaFinal ? "checkmark" : "chevron-forward"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  perguntaContainer: {
    marginBottom: 28,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  perguntaErro: {
    borderColor: 'red',
  },
  perguntaTitulo: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  opcaoButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  opcaoSelecionada: {
    backgroundColor: '#007AFF',
    borderColor: '#005FCC',
  },
  opcaoTexto: {
    color: '#333',
    fontSize: 16,
  },
  opcaoTextoSelecionado: {
    color: '#fff',
    fontWeight: '600',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 6,
  },
  navButtonCinza: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 30,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonAzul: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 30,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
