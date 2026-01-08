/**
 * Cálculos e ordenação de dívidas
 */

/**
 * Ordenar dívidas pelo método Bola de Neve (Snowball)
 * Prioriza dívidas com menor saldo restante
 * @param {Array} debts - Lista de dívidas
 * @returns {Array} Dívidas ordenadas com prioridade
 */
export const sortDebtsBySnowball = debts => {
  return debts
    .filter(d => d.status === 'active')
    .sort((a, b) => a.remainingAmount - b.remainingAmount)
    .map((debt, index) => ({
      ...debt,
      priority: index + 1,
      method: 'snowball',
    }));
};

/**
 * Ordenar dívidas pelo método Avalanche
 * Prioriza dívidas com maior taxa de juros
 * @param {Array} debts - Lista de dívidas
 * @returns {Array} Dívidas ordenadas com prioridade
 */
export const sortDebtsByAvalanche = debts => {
  return debts
    .filter(d => d.status === 'active')
    .sort((a, b) => b.interestRate - a.interestRate)
    .map((debt, index) => ({
      ...debt,
      priority: index + 1,
      method: 'avalanche',
    }));
};

/**
 * Calcular total de juros mensal de todas as dívidas ativas
 * @param {Array} debts - Lista de dívidas
 * @returns {number} Total de juros mensais
 */
export const calculateMonthlyInterest = debts => {
  return debts
    .filter(d => d.status === 'active')
    .reduce((total, debt) => {
      const monthlyInterest = (debt.remainingAmount * (debt.interestRate || 0)) / 100;
      return total + monthlyInterest;
    }, 0);
};

/**
 * Calcular juros mensal de uma dívida específica
 * @param {object} debt - Dívida
 * @returns {number} Juros mensal
 */
export const calculateDebtMonthlyInterest = debt => {
  if (!debt || debt.status !== 'active') return 0;
  return (debt.remainingAmount * (debt.interestRate || 0)) / 100;
};

/**
 * Obter ícone de medalha baseado na prioridade
 * @param {number} priority - Prioridade (1, 2, 3, ...)
 * @returns {string} Emoji da medalha
 */
export const getPriorityIcon = priority => {
  switch (priority) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `${priority}º`;
  }
};

/**
 * Obter cor do badge baseado na prioridade
 * @param {number} priority - Prioridade
 * @returns {string} Classe CSS
 */
export const getPriorityColor = priority => {
  if (priority === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (priority === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
  if (priority === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-blue-100 text-blue-800 border-blue-300';
};

/**
 * Obter descrição do método de priorização
 * @param {string} method - 'snowball' ou 'avalanche'
 * @returns {object} Título e descrição
 */
export const getMethodDescription = method => {
  if (method === 'snowball') {
    return {
      title: 'Método Bola de Neve',
      description: 'Pague primeiro as dívidas menores para ganhar motivação',
      icon: '⛄',
    };
  }
  return {
    title: 'Método Avalanche',
    description: 'Pague primeiro as dívidas com maiores juros para economizar mais',
    icon: '🏔️',
  };
};
