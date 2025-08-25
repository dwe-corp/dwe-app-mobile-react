// src/screens/AtualizacoesInvestidorScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/160x160.png?text=Sem+Imagem';

// ====== Relevância (ajuste à sua realidade) ======
const FINANCE_KEYWORDS = [
  'copom','selic','ipca','inflação','desinflação','juros','curva de juros',
  'câmbio','dólar','ibovespa','b3','futuros','mercado financeiro','renda fixa',
  'cdi','debênture','ntn-b','ltn','tesouro direto','fii','dividendos',
  'petróleo','brent','wti','minério de ferro','commodities',
  'arcabouço fiscal','resultado primário','tesouro','teto de gastos',
  'banco central','bc','bcb','fomc','fed','payroll','cpi','ppi','pmis',
  'bce','china','pib','atividade','balança comercial',
  'petrobras','vale','itaú','bradesco','bancos'
];

// fontes preferidas (whitelist) — ajuste como quiser
const SOURCE_WHITELIST = [
  'valor.globo.com', 'infomoney.com.br', 'exame.com', 'estadao.com.br',
  'oglobo.globo.com', 'forbes.com', 'bloomberg.com', 'reuters.com',
  'wsj.com', 'ft.com', 'financialtimes.com'
];

// fontes a evitar
const SOURCE_BLACKLIST = [
  'youtube.com', 'medium.com'
];

// ====== helpers ======
const getDomain = (u) => {
  try { return new URL(u).hostname.replace(/^www\./,''); } catch { return ''; }
};

const scoreArticle = (a) => {
  const title = (a.title || '').toLowerCase();
  const desc  = (a.description || '').toLowerCase();
  const content = (a.content || '').toLowerCase();

  let score = 0;

  // keywords
  FINANCE_KEYWORDS.forEach(k => {
    const kw = k.toLowerCase();
    if (title.includes(kw)) score += 5;  // título pesa mais
    if (desc.includes(kw))  score += 2;
    if (content.includes(kw)) score += 1;
  });

  // recência (decay log2 ~ até 72h ganha mais pontos)
  if (a.publishedAt) {
    const hours = Math.max(1, (Date.now() - new Date(a.publishedAt).getTime()) / 36e5);
    score += Math.max(0, 10 - Math.log2(hours));
  }

  // boost por fonte
  const dom = getDomain(a.url);
  if (SOURCE_WHITELIST.includes(dom)) score += 6;
  if (SOURCE_BLACKLIST.includes(dom)) score -= 6;

  // gatilhos quentes no título
  ['ibovespa','selic','copom','ipca','fomc','fed','juros'].forEach(hot=>{
    if (title.includes(hot)) score += 3;
  });

  return score;
};

const processArticles = (list) => {
  const raw = (list || []).filter(a => a?.title && a?.url);

  // remove domínios bloqueados
  const filteredByDomain = raw.filter(a => !SOURCE_BLACKLIST.includes(getDomain(a.url)));

  // dedup por título normalizado
  const seen = new Set();
  const deduped = filteredByDomain.filter(a => {
    const key = (a.title || '').trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // score, limiar e ordenação
  const withScore = deduped
    .map(a => ({ ...a, _score: scoreArticle(a) }))
    .filter(a => a._score >= 6) // ajuste o threshold conforme preferir
    .sort((a,b) => b._score - a._score);

  return withScore;
};

export default function AtualizacoesInvestidorScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const apiKeyFromEnv = process.env.EXPO_PUBLIC_NEWSAPI_KEY;
  const apiKeyFromParams = route?.params?.apiKey;
  const API_KEY = apiKeyFromParams || apiKeyFromEnv;

  // Proxy opcional (para CORS no Web e esconder key)
  const PROXY_URL = process.env.EXPO_PUBLIC_NEWS_PROXY_URL || null;
  const supportsProxy = useMemo(() => !!PROXY_URL, [PROXY_URL]);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ====== URLs ======
  const buildHeadlinesUrl = useCallback(() => {
    if (supportsProxy) {
      return `${PROXY_URL}?endpoint=top-headlines&country=br&category=business&pageSize=30`;
    }
    return `https://newsapi.org/v2/top-headlines?country=br&category=business&pageSize=30&apiKey=${API_KEY}`;
  }, [API_KEY, supportsProxy, PROXY_URL]);

  const buildEverythingUrl = useCallback(() => {
    const positive = [
      'copom','selic','ipca','juros','câmbio','dólar','ibovespa','b3',
      '"mercado financeiro"','"renda fixa"','cdi','tesouro',
      'fomc','fed','cpi','ppi','pmis','petróleo','commodities','minério'
    ];
    const negative = ['futebol','celebridade','entretenimento','games'];

    const q = `(${positive.map(t=>`"${t}"`).join(' OR ')})${
      negative.length ? ' ' + negative.map(t=>`-"${t}"`).join(' ') : ''
    }`;

    const from = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10);
    const domains = SOURCE_WHITELIST.join(',');

    if (supportsProxy) {
      return `${PROXY_URL}?endpoint=everything&q=${encodeURIComponent(q)}&language=pt&from=${from}&sortBy=publishedAt&pageSize=40&domains=${encodeURIComponent(domains)}`;
    }
    return `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=pt&from=${from}&sortBy=publishedAt&pageSize=40&domains=${encodeURIComponent(domains)}&apiKey=${API_KEY}`;
  }, [API_KEY, supportsProxy, PROXY_URL]);

  const fetchJson = useCallback(async (url) => {
    const res = await fetch(url, {
      headers: supportsProxy ? { 'x-proxy-api-key': API_KEY || '' } : undefined,
    });
    return res.json();
  }, [supportsProxy, API_KEY]);

  // ====== Fetch com fallback + relevância ======
  const fetchNews = useCallback(async () => {
    if (!API_KEY && !supportsProxy) {
      setError('API key não encontrada. Use EXPO_PUBLIC_NEWSAPI_KEY ou passe via route.params.apiKey (ou configure EXPO_PUBLIC_NEWS_PROXY_URL).');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      setLoading(true);

      // 1) tenta headlines
      const j1 = await fetchJson(buildHeadlinesUrl());
      if (__DEV__) console.log('HEADLINES:', j1?.status, j1?.totalResults);

      let items = [];
      if (j1?.status === 'ok') {
        items = processArticles(j1?.articles);
      } else if (j1?.status !== 'ok' && j1?.message) {
        // Se headlines já veio com erro, guarda para mostrar se o fallback falhar
        console.warn('Headlines error:', j1.message);
      }

      // 2) fallback se nada relevante
      if (!items.length) {
        const j2 = await fetchJson(buildEverythingUrl());
        if (__DEV__) console.log('EVERYTHING:', j2?.status, j2?.totalResults);

        if (j2?.status !== 'ok') {
          throw new Error(j2?.message || 'Falha ao carregar notícias.');
        }

        items = processArticles(j2?.articles);
      }

      setArticles(items);
    } catch (e) {
      setError(e?.message || 'Não foi possível carregar as notícias.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_KEY, supportsProxy, buildHeadlinesUrl, buildEverythingUrl, fetchJson]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, [fetchNews]);

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  const renderItem = ({ item }) => {
    const { title, description, urlToImage, url, source, publishedAt } = item;
    const dateLabel = publishedAt
      ? new Date(publishedAt).toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '';

    return (
      <View style={styles.cardRow}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
          {!!source?.name && (
            <Text style={styles.cardMeta}>
              {source.name}{dateLabel ? ` • ${dateLabel}` : ''}
            </Text>
          )}
          {!!description && (
            <Text style={styles.cardDescription} numberOfLines={3}>
              {description}
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => openLink(url)}>
            <Text style={styles.buttonText}>Ler matéria</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: urlToImage || PLACEHOLDER_IMG }}
          style={styles.cardImage}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Atualizações do Mercado</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando notícias...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={fetchNews}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, idx) => `${item.url}-${idx}`}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#666', textAlign: 'center' }}>
                Nenhuma matéria relevante encontrada agora.
              </Text>
              <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={fetchNews}>
                <Text style={styles.buttonText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB IA */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('IA')}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 16 : 8,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginRight: 32,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },
  cardMeta: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  cardImage: {
    width: 92,
    height: 92,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#F0F0F0',
  },
  button: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    height: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#555',
  },
  errorText: {
    textAlign: 'center',
    color: '#d00',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});
