/**
 * Categorização baseada no histórico do usuário
 * Aprende com padrões anteriores de categorização
 */

import { getUserPatterns } from '../services/categorizationHistory.service';

/**
 * Categoriza uma descrição baseada no histórico do usuário
 * @param {string} description - Descrição da transação
 * @param {string} userId - ID do usuário
 * @returns {Promise<object|null>} Categoria sugerida ou null se sem dados
 */
export const categorizeByHistory = async (description, userId) => {
  if (!description || typeof description !== 'string' || !userId) {
    return null;
  }

  try {
    const patterns = await getUserPatterns(userId);

    if (!patterns || Object.keys(patterns).length === 0) {
      return null; // Sem dados históricos
    }

    const lowerDesc = description.toLowerCase().trim();
    const words = lowerDesc.split(/\s+/);

    const categoryVotes = {};

    // Votar baseado em cada palavra
    words.forEach(word => {
      // Limpar palavra
      const cleanWord = word.replace(/[^a-záàâãéèêíïóôõöúçñ]/g, '');

      if (cleanWord.length < 3) return;

      if (patterns[cleanWord]) {
        // Adicionar votos de cada categoria associada a esta palavra
        Object.entries(patterns[cleanWord]).forEach(([category, count]) => {
          if (!categoryVotes[category]) {
            categoryVotes[category] = 0;
          }
          categoryVotes[category] += count;
        });
      }
    });

    // Se nenhuma palavra teve match no histórico
    if (Object.keys(categoryVotes).length === 0) {
      return null;
    }

    // Ordenar por votos
    const sortedVotes = Object.entries(categoryVotes).sort(([, a], [, b]) => b - a);

    const [bestCategory, votes] = sortedVotes[0];
    const totalVotes = Object.values(categoryVotes).reduce((a, b) => a + b, 0);

    // Calcular confiança baseada em:
    // 1. Proporção de votos da categoria vencedora
    // 2. Número absoluto de votos (mais dados = mais confiança)
    const proportion = votes / totalVotes;
    const votesBonus = Math.min(votes / 10, 0.2); // Máx 0.2 de bônus

    const confidence = Math.min(proportion + votesBonus, 1.0);

    return {
      category: bestCategory,
      confidence,
      method: 'history',
      votes,
      totalVotes,
    };
  } catch (error) {
    console.error('Erro ao categorizar por histórico:', error);
    return null;
  }
};

/**
 * Obtém score de match de cada categoria baseado no histórico
 * @param {string} description - Descrição da transação
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Categorias com scores
 */
export const getHistoryScores = async (description, userId) => {
  if (!description || !userId) {
    return [];
  }

  try {
    const patterns = await getUserPatterns(userId);

    if (!patterns || Object.keys(patterns).length === 0) {
      return [];
    }

    const lowerDesc = description.toLowerCase().trim();
    const words = lowerDesc.split(/\s+/);

    const categoryScores = {};

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-záàâãéèêíïóôõöúçñ]/g, '');

      if (cleanWord.length < 3) return;

      if (patterns[cleanWord]) {
        Object.entries(patterns[cleanWord]).forEach(([category, count]) => {
          if (!categoryScores[category]) {
            categoryScores[category] = 0;
          }
          categoryScores[category] += count;
        });
      }
    });

    const scores = Object.entries(categoryScores)
      .map(([category, score]) => ({
        category,
        score,
        confidence: score / 100, // Normalizar
      }))
      .sort((a, b) => b.score - a.score);

    return scores;
  } catch (error) {
    console.error('Erro ao calcular scores do histórico:', error);
    return [];
  }
};

/**
 * Verifica se há dados históricos suficientes para categorização
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export const hasEnoughHistoryData = async userId => {
  try {
    const patterns = await getUserPatterns(userId);

    if (!patterns) return false;

    // Considerar suficiente se tiver pelo menos 20 palavras diferentes
    // com pelo menos 3 ocorrências cada
    const significantWords = Object.values(patterns).filter(categories => {
      const totalOccurrences = Object.values(categories).reduce((sum, count) => sum + count, 0);
      return totalOccurrences >= 3;
    });

    return significantWords.length >= 20;
  } catch (error) {
    console.error('Erro ao verificar dados históricos:', error);
    return false;
  }
};
