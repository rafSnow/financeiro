/**
 * Serviço de categorização automática híbrida
 * Combina histórico do usuário + regras de keywords + scoring
 */

import { categorizeByHistory } from '../utils/categorization/historyBased';
import { categorizeByKeywords } from '../utils/categorization/keywordRules';
import { getBestCategory, getCategoryScores } from '../utils/categorization/scorer';

/**
 * Categoriza uma despesa usando sistema híbrido
 * Prioridade: 1. Histórico do usuário, 2. Keywords, 3. Scoring, 4. Fallback
 * @param {string} description - Descrição da transação
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} Categoria sugerida com confiança
 */
export const autoCategorize = async (description, userId) => {
  if (!description || typeof description !== 'string') {
    return {
      category: 'Outros',
      confidence: 0.3,
      method: 'fallback',
    };
  }

  try {
    // 1. HISTÓRICO DO USUÁRIO (mais específico e personalizado)
    const historyResult = await categorizeByHistory(description, userId);

    if (historyResult && historyResult.confidence > 0.7) {
      return {
        category: historyResult.category,
        confidence: historyResult.confidence,
        method: 'history',
        votes: historyResult.votes,
      };
    }

    // 2. KEYWORDS (regras gerais brasileiras)
    const keywordResult = categorizeByKeywords(description);

    if (keywordResult && keywordResult.confidence > 0.8) {
      return {
        category: keywordResult.category,
        confidence: keywordResult.confidence,
        method: 'keyword',
      };
    }

    // 3. SCORING AVANÇADO (múltiplos níveis de match)
    const scoringResult = getBestCategory(description);

    if (scoringResult && scoringResult.confidence > 0.6) {
      return {
        category: scoringResult.category,
        confidence: scoringResult.confidence,
        method: 'scoring',
        score: scoringResult.score,
        alternatives: scoringResult.alternatives,
      };
    }

    // 4. ESCOLHER O MELHOR ENTRE OS INCERTOS
    const results = [historyResult, keywordResult, scoringResult].filter(Boolean);

    if (results.length > 0) {
      const best = results.reduce((prev, current) =>
        current.confidence > prev.confidence ? current : prev
      );

      return {
        category: best.category,
        confidence: best.confidence,
        method: `${best.method}_uncertain`,
      };
    }

    // 5. FALLBACK: Categoria "Outros"
    return {
      category: 'Outros',
      confidence: 0.3,
      method: 'fallback',
    };
  } catch (error) {
    console.error('Erro ao categorizar automaticamente:', error);
    return {
      category: 'Outros',
      confidence: 0.2,
      method: 'error',
      error: error.message,
    };
  }
};

/**
 * Sugere múltiplas categorias possíveis
 * @param {string} description - Descrição da transação
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Top 3 sugestões ordenadas por confiança
 */
export const suggestCategories = async (description, userId) => {
  if (!description || typeof description !== 'string') {
    return [];
  }

  try {
    const suggestions = [];

    // HISTÓRICO DO USUÁRIO
    const historyResult = await categorizeByHistory(description, userId);

    if (historyResult) {
      suggestions.push({
        category: historyResult.category,
        confidence: historyResult.confidence,
        source: 'history',
        votes: historyResult.votes,
      });
    }

    // KEYWORDS
    const keywordResult = categorizeByKeywords(description);

    if (keywordResult && keywordResult.category !== 'Outros') {
      suggestions.push({
        category: keywordResult.category,
        confidence: keywordResult.confidence,
        source: 'keyword',
      });
    }

    // SCORING (top 3)
    const categoryScores = getCategoryScores(description);

    categoryScores
      .filter(item => item.score > 0)
      .slice(0, 3)
      .forEach(item => {
        suggestions.push({
          category: item.category,
          confidence: item.confidence,
          source: 'scoring',
          score: item.score,
        });
      });

    // Remover duplicatas, mantendo a maior confiança
    const uniqueMap = {};

    suggestions.forEach(suggestion => {
      const currentBest = uniqueMap[suggestion.category];

      if (!currentBest || suggestion.confidence > currentBest.confidence) {
        uniqueMap[suggestion.category] = suggestion;
      }
    });

    // Ordenar por confiança e retornar top 3
    const uniqueSuggestions = Object.values(uniqueMap)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return uniqueSuggestions;
  } catch (error) {
    console.error('Erro ao sugerir categorias:', error);
    return [];
  }
};

/**
 * Categoriza múltiplas transações em lote
 * @param {Array} transactions - Lista de transações com descrição
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Transações com categoria sugerida
 */
export const categorizeBatch = async (transactions, userId) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  try {
    const categorized = await Promise.all(
      transactions.map(async transaction => {
        const result = await autoCategorize(transaction.description, userId);

        return {
          ...transaction,
          suggestedCategory: result.category,
          confidence: result.confidence,
          categorizationMethod: result.method,
        };
      })
    );

    return categorized;
  } catch (error) {
    console.error('Erro ao categorizar em lote:', error);
    return transactions.map(t => ({
      ...t,
      suggestedCategory: 'Outros',
      confidence: 0.2,
      categorizationMethod: 'error',
    }));
  }
};

/**
 * Verifica se uma categorização precisa de revisão manual
 * @param {object} result - Resultado de autoCategorize()
 * @returns {boolean}
 */
export const needsManualReview = result => {
  if (!result) return true;

  // Confiança muito baixa
  if (result.confidence < 0.5) return true;

  // Categoria "Outros" com baixa confiança
  if (result.category === 'Outros' && result.confidence < 0.7) return true;

  // Método de fallback ou erro
  if (result.method === 'fallback' || result.method === 'error') return true;

  // Métodos incertos
  if (result.method?.includes('_uncertain')) return true;

  // Alternativas muito próximas
  if (result.alternatives && result.alternatives.length > 0) {
    const best = result.score || result.confidence * 100;
    const secondBest = result.alternatives[0]?.score || result.alternatives[0]?.confidence * 100;

    if (best > 0 && secondBest / best > 0.85) return true;
  }

  return false;
};

/**
 * Obtém estatísticas de categorização para análise
 * @param {Array} results - Array de resultados de autoCategorize()
 * @returns {object} Estatísticas agregadas
 */
export const getCategorizationStats = results => {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      total: 0,
      byMethod: {},
      avgConfidence: 0,
      needsReview: 0,
    };
  }

  const stats = {
    total: results.length,
    byMethod: {},
    avgConfidence: 0,
    needsReview: 0,
  };

  let totalConfidence = 0;

  results.forEach(result => {
    // Contar por método
    const method = result.method || 'unknown';
    if (!stats.byMethod[method]) {
      stats.byMethod[method] = 0;
    }
    stats.byMethod[method]++;

    // Somar confiança
    totalConfidence += result.confidence || 0;

    // Contar que precisam revisão
    if (needsManualReview(result)) {
      stats.needsReview++;
    }
  });

  stats.avgConfidence = totalConfidence / results.length;

  return stats;
};
