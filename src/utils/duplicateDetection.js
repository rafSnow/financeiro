import { Timestamp } from 'firebase/firestore';
import { getAllExpenses } from '../services/expenses.service';
import { getAllIncomes } from '../services/income.service';

/**
 * Calcula a distância de Levenshtein entre duas strings
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Distância de edição
 */
const editDistance = (str1, str2) => {
  const matrix = [];

  // Inicializar primeira coluna
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  // Inicializar primeira linha
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Preencher matriz
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substituição
          matrix[i][j - 1] + 1, // Inserção
          matrix[i - 1][j] + 1 // Remoção
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Calcula a similaridade entre duas strings (0 a 1)
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Similaridade (0 = totalmente diferente, 1 = idênticas)
 */
export const stringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = editDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Verifica se duas datas são próximas (com tolerância de dias)
 * @param {Date} date1 - Primeira data
 * @param {Date} date2 - Segunda data
 * @param {number} toleranceDays - Tolerância em dias
 * @returns {boolean} true se as datas são próximas
 */
const isSameDay = (date1, date2, toleranceDays = 1) => {
  if (!date1 || !date2) return false;

  const d1 = date1 instanceof Date ? date1 : date1.toDate();
  const d2 = date2 instanceof Date ? date2 : date2.toDate();

  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= toleranceDays;
};

/**
 * Busca transações recentes (últimos N dias)
 * @param {string} userId - ID do usuário
 * @param {number} days - Número de dias
 * @returns {Promise<Array>} Transações recentes
 */
const getRecentTransactions = async (userId, days = 90) => {
  try {
    const [expenses, incomes] = await Promise.all([getAllExpenses(userId), getAllIncomes(userId)]);

    // Filtrar por data (últimos N dias)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    const recentExpenses = expenses
      .filter(e => e.date >= cutoffTimestamp)
      .map(e => ({ ...e, type: 'expense' }));

    const recentIncomes = incomes
      .filter(i => i.date >= cutoffTimestamp)
      .map(i => ({ ...i, type: 'income' }));

    return [...recentExpenses, ...recentIncomes];
  } catch (error) {
    console.error('Erro ao buscar transações recentes:', error);
    return [];
  }
};

/**
 * Detecta duplicatas em um array de novas transações
 * @param {Array} newTransactions - Novas transações a serem importadas
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Objeto com arrays de duplicatas e únicas
 */
export const findDuplicates = async (newTransactions, userId) => {
  if (!newTransactions || newTransactions.length === 0) {
    return { duplicates: [], unique: [] };
  }

  try {
    // Buscar transações existentes dos últimos 90 dias
    const existingTransactions = await getRecentTransactions(userId, 90);

    const duplicates = [];
    const unique = [];

    newTransactions.forEach(newTxn => {
      const isDuplicate = existingTransactions.some(existing => {
        // Verificar se o tipo é o mesmo
        if (newTxn.type !== existing.type) return false;

        // Mesma data (±1 dia)
        const sameDate = isSameDay(newTxn.date, existing.date, 1);

        // Mesmo valor (com tolerância de 0.01)
        const sameAmount = Math.abs(newTxn.amount - existing.amount) < 0.01;

        // Descrição similar (>80% match)
        const similarity = stringSimilarity(
          (newTxn.description || '').toLowerCase(),
          (existing.description || '').toLowerCase()
        );

        return sameDate && sameAmount && similarity > 0.8;
      });

      if (isDuplicate) {
        duplicates.push({ ...newTxn, isDuplicate: true });
      } else {
        unique.push({ ...newTxn, isDuplicate: false });
      }
    });

    return { duplicates, unique };
  } catch (error) {
    console.error('Erro ao detectar duplicatas:', error);
    // Em caso de erro, considerar todas como únicas
    return {
      duplicates: [],
      unique: newTransactions.map(t => ({ ...t, isDuplicate: false })),
    };
  }
};

/**
 * Marca transações como duplicatas ou únicas
 * @param {Array} transactions - Array de transações
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Transações marcadas
 */
export const markDuplicates = async (transactions, userId) => {
  const { duplicates, unique } = await findDuplicates(transactions, userId);
  return [...duplicates, ...unique];
};

export default {
  findDuplicates,
  markDuplicates,
  stringSimilarity,
};
