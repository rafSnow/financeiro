/**
 * Funções de cálculo financeiro
 */

/**
 * Calcula o total de despesas
 * @param {Array} expenses - Array de despesas
 * @returns {number} Total de despesas
 */
export const calculateTotalExpenses = expenses => {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
};

/**
 * Calcula o total de rendas
 * @param {Array} incomes - Array de rendas
 * @returns {number} Total de rendas
 */
export const calculateTotalIncome = incomes => {
  if (!incomes || incomes.length === 0) return 0;
  return incomes.reduce((total, income) => total + (income.amount || 0), 0);
};

/**
 * Calcula o saldo disponível
 * @param {number} income - Total de renda
 * @param {number} expenses - Total de despesas
 * @returns {number} Saldo disponível
 */
export const calculateAvailableBalance = (income, expenses) => {
  return income - expenses;
};

/**
 * Calcula o total de dívidas
 * @param {Array} debts - Array de dívidas
 * @returns {number} Total de dívidas
 */
export const calculateTotalDebts = debts => {
  if (!debts || debts.length === 0) return 0;
  return debts
    .filter(debt => debt.status === 'active')
    .reduce((total, debt) => total + (debt.remainingAmount || 0), 0);
};

/**
 * Agrupa despesas por categoria
 * @param {Array} expenses - Array de despesas
 * @returns {Object} Objeto com total por categoria
 */
export const groupExpensesByCategory = expenses => {
  if (!expenses || expenses.length === 0) return {};

  const grouped = {};

  expenses.forEach(expense => {
    const category = expense.category || 'outros';
    if (!grouped[category]) {
      grouped[category] = 0;
    }
    grouped[category] += expense.amount || 0;
  });

  return grouped;
};

/**
 * Calcula o percentual de uma categoria em relação ao total
 * @param {number} value - Valor da categoria
 * @param {number} total - Total geral
 * @returns {number} Percentual (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

/**
 * Soma valores de um array por uma chave específica
 * @param {Array} array - Array de objetos
 * @param {string} key - Chave a somar
 * @returns {number} Soma total
 */
export const sumArray = (array, key) => {
  if (!array || array.length === 0) return 0;
  return array.reduce((sum, item) => sum + (item[key] || 0), 0);
};

/**
 * Obtém as top N despesas
 * @param {Array} expenses - Array de despesas
 * @param {number} limit - Número de despesas a retornar
 * @returns {Array} Top despesas ordenadas por valor
 */
export const getTopExpenses = (expenses, limit = 3) => {
  if (!expenses || expenses.length === 0) return [];

  return [...expenses].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, limit);
};

/**
 * Obtém a categoria com maior gasto
 * @param {Object} groupedExpenses - Despesas agrupadas por categoria
 * @returns {Object} { category, amount } da categoria com maior gasto
 */
export const getTopCategory = groupedExpenses => {
  if (!groupedExpenses || Object.keys(groupedExpenses).length === 0) {
    return { category: null, amount: 0 };
  }

  let topCategory = null;
  let topAmount = 0;

  Object.entries(groupedExpenses).forEach(([category, amount]) => {
    if (amount > topAmount) {
      topCategory = category;
      topAmount = amount;
    }
  });

  return { category: topCategory, amount: topAmount };
};
