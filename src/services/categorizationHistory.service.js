/**
 * Serviço para gerenciar histórico de categorizações
 * Permite aprendizado com correções do usuário
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Salva histórico de categorização no Firestore
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da categorização
 * @param {string} data.description - Descrição da transação
 * @param {string} data.suggestedCategory - Categoria sugerida pelo sistema
 * @param {string} data.finalCategory - Categoria escolhida pelo usuário
 * @param {boolean} data.wasCorrected - Se o usuário corrigiu a sugestão
 * @param {number} data.confidence - Confiança da sugestão (0-1)
 * @param {string} data.method - Método usado (keyword, history, scoring, default)
 * @returns {Promise<string>} ID do documento criado
 */
export const saveCategorizationHistory = async (userId, data) => {
  try {
    const historyData = {
      userId,
      description: data.description || '',
      suggestedCategory: data.suggestedCategory || 'Outros',
      finalCategory: data.finalCategory || 'Outros',
      wasCorrected: data.wasCorrected || false,
      confidence: data.confidence || 0,
      method: data.method || 'unknown',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'categorization_history'), historyData);

    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar histórico de categorização:', error);
    throw error;
  }
};

/**
 * Busca histórico de categorizações de um usuário
 * @param {string} userId - ID do usuário
 * @param {number} limitCount - Limite de registros (padrão: 100)
 * @returns {Promise<Array>} Lista de históricos
 */
export const getCategorizationHistory = async (userId, limitCount = 100) => {
  try {
    const q = query(
      collection(db, 'categorization_history'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const history = [];

    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return history;
  } catch (error) {
    console.error('Erro ao buscar histórico de categorização:', error);
    throw error;
  }
};

/**
 * Extrai padrões do histórico do usuário
 * Analisa quais palavras estão associadas a quais categorias
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} Padrões encontrados
 */
export const getUserPatterns = async userId => {
  try {
    const history = await getCategorizationHistory(userId, 500);
    const patterns = {};

    history.forEach(item => {
      // Normalizar e limpar descrição
      const description = (item.description || '').toLowerCase().trim();
      const words = description.split(/\s+/);

      words.forEach(word => {
        // Ignorar palavras muito curtas ou números puros
        if (word.length < 3 || /^\d+$/.test(word)) return;

        // Remover caracteres especiais
        const cleanWord = word.replace(/[^a-záàâãéèêíïóôõöúçñ]/g, '');

        if (cleanWord.length < 3) return;

        // Usar categoria final (escolha do usuário)
        const category = item.finalCategory || 'Outros';

        // Inicializar estrutura se necessário
        if (!patterns[cleanWord]) {
          patterns[cleanWord] = {};
        }

        if (!patterns[cleanWord][category]) {
          patterns[cleanWord][category] = 0;
        }

        // Incrementar contador
        patterns[cleanWord][category]++;
      });
    });

    return patterns;
  } catch (error) {
    console.error('Erro ao extrair padrões do usuário:', error);
    throw error;
  }
};

/**
 * Obtém estatísticas de acurácia do sistema
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} Estatísticas de acurácia
 */
export const getCategorizationStats = async userId => {
  try {
    const history = await getCategorizationHistory(userId, 1000);

    if (history.length === 0) {
      return {
        total: 0,
        correct: 0,
        corrected: 0,
        accuracy: 0,
        byMethod: {},
      };
    }

    const stats = {
      total: history.length,
      correct: 0,
      corrected: 0,
      byMethod: {},
    };

    history.forEach(item => {
      // Contar correções
      if (item.wasCorrected) {
        stats.corrected++;
      } else {
        stats.correct++;
      }

      // Estatísticas por método
      const method = item.method || 'unknown';
      if (!stats.byMethod[method]) {
        stats.byMethod[method] = {
          total: 0,
          correct: 0,
          accuracy: 0,
        };
      }

      stats.byMethod[method].total++;
      if (!item.wasCorrected) {
        stats.byMethod[method].correct++;
      }
    });

    // Calcular accuracy geral
    stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;

    // Calcular accuracy por método
    Object.keys(stats.byMethod).forEach(method => {
      const methodStats = stats.byMethod[method];
      methodStats.accuracy = methodStats.total > 0 ? methodStats.correct / methodStats.total : 0;
    });

    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
};

/**
 * Busca categorias mais comuns para uma palavra específica
 * @param {string} userId - ID do usuário
 * @param {string} word - Palavra para buscar
 * @returns {Promise<Array>} Categorias ordenadas por frequência
 */
export const getCategoryFrequencyForWord = async (userId, word) => {
  try {
    const patterns = await getUserPatterns(userId);
    const cleanWord = word.toLowerCase().trim();

    if (!patterns[cleanWord]) {
      return [];
    }

    const categories = Object.entries(patterns[cleanWord])
      .map(([category, count]) => ({
        category,
        count,
        frequency: count,
      }))
      .sort((a, b) => b.count - a.count);

    return categories;
  } catch (error) {
    console.error('Erro ao buscar frequência de categoria:', error);
    throw error;
  }
};
