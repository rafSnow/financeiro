/**
 * Sistema de pontuação para categorização automática
 * Calcula scores baseado em diferentes tipos de match
 */

import { KEYWORD_RULES } from './keywordRules';

/**
 * Valores de pontuação para diferentes tipos de match
 */
const SCORE_VALUES = {
  EXACT_MATCH: 100, // Palavra exata encontrada
  STARTS_WITH: 75, // Descrição começa com a palavra-chave
  CONTAINS: 50, // Descrição contém a palavra-chave
  PARTIAL: 30, // Match parcial (substring)
};

/**
 * Calcula o score de match entre uma descrição e keywords de uma categoria
 * @param {string} description - Descrição da transação
 * @param {string} category - Nome da categoria
 * @param {Array<string>} keywords - Lista de palavras-chave da categoria
 * @returns {number} Score total
 */
export const scoreCategorizationMatch = (description, category, keywords) => {
  if (!description || typeof description !== 'string') return 0;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return 0;

  const lowerDesc = description.toLowerCase().trim();
  const words = lowerDesc.split(/\s+/);
  let totalScore = 0;

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();

    // EXACT MATCH: palavra exata encontrada
    if (words.includes(lowerKeyword)) {
      totalScore += SCORE_VALUES.EXACT_MATCH;
      continue;
    }

    // STARTS WITH: descrição começa com a palavra-chave
    if (lowerDesc.startsWith(lowerKeyword)) {
      totalScore += SCORE_VALUES.STARTS_WITH;
      continue;
    }

    // CONTAINS: descrição contém a palavra-chave
    if (lowerDesc.includes(lowerKeyword)) {
      totalScore += SCORE_VALUES.CONTAINS;
      continue;
    }

    // PARTIAL MATCH: verifica se alguma palavra da descrição contém a keyword
    for (const word of words) {
      if (word.includes(lowerKeyword) || lowerKeyword.includes(word)) {
        totalScore += SCORE_VALUES.PARTIAL;
        break;
      }
    }
  }

  return totalScore;
};

/**
 * Calcula scores de todas as categorias para uma descrição
 * @param {string} description - Descrição da transação
 * @returns {Array<object>} Array de categorias com seus scores
 */
export const getCategoryScores = description => {
  if (!description || typeof description !== 'string') {
    return [];
  }

  const scores = [];

  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    const score = scoreCategorizationMatch(description, category, keywords);

    scores.push({
      category,
      score,
      confidence: Math.min(score / 100, 1.0), // Normaliza para 0-1
    });
  }

  // Ordena por score decrescente
  return scores.sort((a, b) => b.score - a.score);
};

/**
 * Retorna a melhor categoria para uma descrição
 * @param {string} description - Descrição da transação
 * @returns {object} Categoria sugerida com confiança e alternativas
 */
export const getBestCategory = description => {
  const scores = getCategoryScores(description);

  if (!scores || scores.length === 0) {
    return {
      category: 'Outros',
      confidence: 0.3,
      method: 'default',
      alternatives: [],
    };
  }

  const best = scores[0];
  const alternatives = scores.slice(1, 4).filter(s => s.score > 0);

  // Se o melhor score é muito baixo, retorna "Outros"
  if (best.score < SCORE_VALUES.PARTIAL) {
    return {
      category: 'Outros',
      confidence: 0.3,
      method: 'default',
      alternatives,
    };
  }

  return {
    category: best.category,
    confidence: best.confidence,
    method: 'scoring',
    score: best.score,
    alternatives,
  };
};

/**
 * Calcula a similaridade entre duas strings (0-1)
 * Usa algoritmo de Levenshtein simplificado
 * @param {string} str1
 * @param {string} str2
 * @returns {number} Similaridade (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1.0;

  // Matriz de distâncias
  const matrix = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deleção
        matrix[i][j - 1] + 1, // Inserção
        matrix[i - 1][j - 1] + cost // Substituição
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1 - distance / maxLen;
};

/**
 * Verifica se uma descrição precisa de categorização manual
 * @param {object} result - Resultado de getBestCategory()
 * @returns {boolean}
 */
export const needsManualReview = result => {
  if (!result) return true;

  // Confiança muito baixa
  if (result.confidence < 0.5) return true;

  // Categoria "Outros" com baixa confiança
  if (result.category === 'Outros' && result.confidence < 0.7) return true;

  // Alternativas muito próximas do melhor resultado
  if (result.alternatives && result.alternatives.length > 0) {
    const best = result.score || 0;
    const secondBest = result.alternatives[0].score || 0;
    if (best > 0 && secondBest / best > 0.8) return true;
  }

  return false;
};
