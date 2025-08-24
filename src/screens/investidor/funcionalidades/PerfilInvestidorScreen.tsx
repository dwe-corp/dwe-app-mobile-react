import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  InteractionManager,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUserSuitability } from '../../../services/suitabilityService';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilInvestidorScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { userName, userEmail } = useAuth();

  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [erros, setErros] = useState<Record<number, boolean>>({});
  const [shouldScrollTop, setShouldScrollTop] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // === helper de confirmação (web/app) ===
  const confirmDiscardWebSafe = (title: string, message: string): Promise<boolean> => {
    if (Platform.OS === 'web') {
      // window.confirm retorna boolean (OK/Cancelar)
      // eslint-disable-next-line no-alert
      const ok = window.confirm(`${title}\n\n${message}`);
      return Promise.resolve(ok);
    }
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Sim, voltar', style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });
  };

  // Scroll animado confiável ao trocar de página
  useEffect(() => {
    setShouldScrollTop(true);
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      });
    });
    return () => {
      // @ts-ignore
      task?.cancel?.();
    };
  }, [paginaAtual]);

  const perguntas = [
    { titulo: '1. Qual é seu principal objetivo com os investimentos?', opcoes: ['Preservar meu capital com segurança.', 'Obter rendimentos regulares e moderados.', 'Maximizar ganhos, aceitando riscos maiores.'] },
    { titulo: '2. Qual seu nível de conhecimento sobre investimentos?', opcoes: ['Nenhum ou muito básico.', 'Intermediário.', 'Avançado ou profissional.'] },
    { titulo: '3. Qual seu horizonte de investimento?', opcoes: ['Curto prazo (até 1 ano).', 'Médio prazo (1 a 5 anos).', 'Longo prazo (mais de 5 anos).'] },
    { titulo: '4. Você já investiu em ações ou fundos de ações?', opcoes: ['Nunca.', 'Sim, mas com valores pequenos.', 'Sim, com frequência e valores relevantes.'] },
    { titulo: '5. Qual a sua idade?', opcoes: ['Acima de 60 anos.', 'Entre 36 e 59 anos.', 'Até 35 anos.'] },
    { titulo: '6. Qual é a sua principal fonte de renda?', opcoes: ['Salário fixo.', 'Renda variável com certa estabilidade.', 'Empreendimentos ou renda variável instável.'] },
    { titulo: '7. Qual é a sua renda mensal média?', opcoes: ['Até R$5.000.', 'De R$5.000 a R$15.000.', 'Acima de R$15.000.'] },
    { titulo: '8. Qual o percentual da sua renda que pode ser investido?', opcoes: ['Até 10%.', 'Entre 10% e 30%.', 'Mais de 30%.'] },
    { titulo: '9. Possui reserva de emergência (3 a 6 meses de despesas)?', opcoes: ['Não.', 'Parcialmente.', 'Sim.'] },
    { titulo: '10. Como você reagiria se seus investimentos caíssem 10% em uma semana?', opcoes: ['Venderia tudo imediatamente.', 'Aguardaria para entender o cenário.', 'Veria como oportunidade para comprar mais.'] },
    { titulo: '11. Você já investiu em fundos multimercado ou cambiais?', opcoes: ['Não.', 'Sim, mas com receio.', 'Sim, sem problemas.'] },
    { titulo: '12. Já teve perdas superiores a 10% em investimentos?', opcoes: ['Não e não estou disposto a correr esse risco.', 'Sim, mas fiquei desconfortável.', 'Sim, e considero parte do processo.'] },
    { titulo: '13. Qual a composição ideal de sua carteira?', opcoes: ['100% renda fixa.', 'Maioria renda fixa com pequena parte variável.', 'Diversificada com significativa parte em renda variável.'] },
    { titulo: '14. Como você descreveria sua experiência com investimentos?', opcoes: ['Nenhuma.', 'Alguma experiência.', 'Experiente.'] },
    { titulo: '15. Você entende o que são produtos como COE, FIDC ou Debêntures?', opcoes: ['Não conheço.', 'Já ouvi falar.', 'Sim, conheço e já investi.'] },
    { titulo: '16. Com que frequência você acompanha seus investimentos?', opcoes: ['Raramente.', 'Mensalmente.', 'Diariamente ou semanalmente.'] },
    { titulo: '17. Você já investiu em produtos internacionais?', opcoes: ['Nunca.', 'Tenho interesse, mas não investi ainda.', 'Sim.'] },
    { titulo: '18. Você tem dívidas em aberto?', opcoes: ['Sim.', 'Algumas, mas controladas.', 'Não.'] },
    { titulo: '19. Você se considera emocional ao lidar com dinheiro?', opcoes: ['Sim, muito.', 'Um pouco.', 'Não, sou racional.'] },
    { titulo: '20. Em uma crise de mercado, qual seria sua reação?', opcoes: ['Resgatar tudo para evitar mais perdas.', 'Esperar até os mercados estabilizarem.', 'Aproveitar para investir mais.'] },
  ];

  const perguntasPorPagina = 5;
  const inicio = paginaAtual * perguntasPorPagina;
  const fim = inicio + perguntasPorPagina;
  const paginaFinal = fim >= perguntas.length;

  const inferirPerfil = (A: number, B: number, C: number) => {
    if (C >= A && C >= B) return 'AGRESSIVO';
    if (B >= A && B >= C) return 'MODERADO';
    return 'CONSERVADOR';
  };

  const handleSelecionar = (index: number, opcao: string) => {
    setRespostas(prev => ({ ...prev, [index]: opcao }));
    setErros(prev => ({ ...prev, [index]: false }));
  };

  const handleAvancar = async () => {
    if (submitting) return;

    const perguntasPaginaAtual = perguntas.slice(inicio, fim);
    const todasRespondidas = perguntasPaginaAtual.every((_, i) => respostas[inicio + i]);

    if (!todasRespondidas) {
      const novasErros: Record<number, boolean> = {};
      perguntasPaginaAtual.forEach((_, i) => {
        if (!respostas[inicio + i]) novasErros[inicio + i] = true;
      });
      setErros(novasErros);
      Alert.alert('Atenção', 'Por favor, responda todas as perguntas antes de continuar.');
      return;
    }

    if (paginaFinal) {
      try {
        setSubmitting(true);

        const contagem = { A: 0, B: 0, C: 0 };
        Object.entries(respostas).forEach(([indexStr, resposta]) => {
          const idx = parseInt(indexStr, 10);
          const opcaoIndex = perguntas[idx].opcoes.indexOf(resposta);
          if (opcaoIndex === 0) contagem.A++;
          if (opcaoIndex === 1) contagem.B++;
          if (opcaoIndex === 2) contagem.C++;
        });

        const name = (userName ?? '').trim();
        const email = (userEmail ?? '').trim().toLowerCase();

        if (!name || !email) {
          Alert.alert('Erro', 'E-mail do usuário não encontrado. Faça login novamente.');
          return;
        }

        const perfil = inferirPerfil(contagem.A, contagem.B, contagem.C);
        const payloadPreview = { name, email, ...contagem, perfil, total: perguntas.length };
        console.log('[Suitability] Enviando payload:', payloadPreview);

        const resultado: any = await registerUserSuitability(
          name,
          email,
          contagem.A,
          contagem.B,
          contagem.C
        );

        console.log('[Suitability] Resposta da API:', resultado);

        if (resultado?.success) {
          Alert.alert('Sucesso', 'Seu perfil foi registrado com sucesso!');
          // @ts-expect-error
          navigation.navigate('Home');
        } else {
          const msg =
            resultado?.message ||
            resultado?.error ||
            'Não foi possível registrar seu perfil. Tente novamente.';
          Alert.alert('Erro', String(msg));
        }
      } catch (err: any) {
        console.log('[Suitability] Erro na chamada:', err);
        const msg = err?.message ?? 'Erro ao enviar dados. Verifique sua conexão.';
        Alert.alert('Erro', String(msg));
      } finally {
        setSubmitting(false);
      }
    } else {
      setPaginaAtual(prev => prev + 1);
    }
  };

  const handleVoltarPagina = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(prev => prev - 1);
    }
  };

  const handleHeaderBackToHome = async () => {
    const respondeuAlgo = Object.keys(respostas).length > 0;
    if (respondeuAlgo) {
      const ok = await confirmDiscardWebSafe(
        'Atenção',
        'Suas respostas preenchidas não serão salvas. Deseja voltar para a Home?'
      );
      if (!ok) return;
    }
    // @ts-expect-error
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header centralizado com botão de sair para Home apenas na primeira página */}
        <View style={styles.header}>
          {paginaAtual === 0 && (
            <TouchableOpacity
              onPress={handleHeaderBackToHome}
              style={styles.headerBack}
              hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              disabled={submitting}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Suitability</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => {
            if (shouldScrollTop) {
              scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
              setShouldScrollTop(false);
            }
          }}
        >
          {perguntas.slice(inicio, fim).map((pergunta, index) => {
            const perguntaIndex = inicio + index;
            return (
              <View
                key={perguntaIndex}
                style={[
                  styles.perguntaContainer,
                  erros[perguntaIndex] && styles.perguntaErro,
                ]}
              >
                <Text style={styles.perguntaTitulo}>{pergunta.titulo}</Text>
                {pergunta.opcoes.map((opcao, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.opcaoButton}
                    onPress={() => handleSelecionar(perguntaIndex, opcao)}
                    activeOpacity={0.8}
                    disabled={submitting}
                  >
                    <View style={styles.radioContent}>
                      <View
                        style={[
                          styles.radioOuter,
                          respostas[perguntaIndex] === opcao && styles.radioOuterSelected,
                          { marginTop: 2 },
                        ]}
                      >
                        {respostas[perguntaIndex] === opcao && <View style={styles.radioInner} />}
                      </View>
                      <Text
                        style={[
                          styles.opcaoTexto,
                          respostas[perguntaIndex] === opcao && styles.opcaoTextoSelecionado,
                        ]}
                      >
                        {opcao}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          <View style={[styles.footerButtons, { justifyContent: paginaAtual > 0 ? 'space-between' : 'flex-end' }]}>
            {paginaAtual > 0 && (
              <TouchableOpacity style={styles.navButtonCinza} onPress={handleVoltarPagina} disabled={submitting}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.navButtonAzul} onPress={handleAvancar} disabled={submitting}>
              <Ionicons name={paginaFinal ? 'checkmark' : 'chevron-forward'} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    paddingVertical: 6,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  content: {
    paddingTop: 12,
    paddingBottom: 30,
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
    alignItems: 'stretch',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  opcaoTexto: {
    fontSize: 16,
    color: '#333',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  opcaoTextoSelecionado: {
    fontWeight: '600',
    color: '#007AFF',
  },

  footerButtons: {
    flexDirection: 'row',
    gap: 12,
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
  },
});