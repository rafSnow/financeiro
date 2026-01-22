/**
 * Gerador de Insights Financeiros Automáticos
 * Analisa dados do usuário e gera recomendações personalizadas
 */

import { DEFAULT_CATEGORIES } from '../services/categories.service';
import { getExpenses } from '../services/expenses.service';
import { getGoals } from '../services/goals.service';
import { getIncomes } from '../services/income.service';

/**
 * Médias nacionais de gastos por categoria (%)
 */
const CATEGORY_AVERAGES = {
  Alimentação: 20,
  Transporte: 15,
  Moradia: 30,
  Saúde: 10,
  Educação: 5,
  Lazer: 5,
  Vestuário: 5,
  Serviços: 5,
  Outros: 5,
};

/**
 * Utilitário: Soma valores de um array
 */
const sumArray = (arr, key) => {
  return arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
};

/**
 * Utilitário: Agrupa array por chave
 */
const groupBy = (arr, key) => {
  return arr.reduce((grouped, item) => {
    const groupKey = item[key] || 'Outros';
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});
};

/**
 * Obtém o nome da categoria
 */
const getCategoryName = category => {
  const cat = DEFAULT_CATEGORIES.find(c => c.name === category);
  return cat ? cat.name : category || 'Outros';
};

/**
 * Analisa crescimento de categorias
 */
const analyzeCategoryGrowth = (current, previous) => {
  const currentByCategory = groupBy(current, 'category');
  const previousByCategory = groupBy(previous, 'category');

  const growth = [];

  Object.keys(currentByCategory).forEach(category => {
    const currentTotal = sumArray(currentByCategory[category], 'amount');
    const previousTotal = previousByCategory[category]
      ? sumArray(previousByCategory[category], 'amount')
      : 0;

    if (previousTotal > 0) {
      const percentGrowth = ((currentTotal - previousTotal) / previousTotal) * 100;
      growth.push({
        category,
        categoryName: getCategoryName(category),
        currentTotal,
        previousTotal,
        growth: percentGrowth,
      });
    }
  });

  return growth.sort((a, b) => b.growth - a.growth);
};

/**
 * Encontra oportunidades de economia
 */
const findSavingsOpportunity = (expenses, incomes) => {
  const totalIncome = sumArray(incomes, 'amount');
  
  if (totalIncome === 0) return null;

  const byCategory = groupBy(expenses, 'category');

  // Identificar categoria com gasto > média nacional + 10%
  for (const [category, items] of Object.entries(byCategory)) {
    const total = sumArray(items, 'amount');
    const percent = (total / totalIncome) * 100;

    const categoryName = getCategoryName(category);
    const averagePercent = CATEGORY_AVERAGES[categoryName] || 10;

    if (percent > averagePercent + 10) {
      const potentialSavings = total - (totalIncome * averagePercent) / 100;
      return {
        category,
        categoryName,
        amount: potentialSavings,
        message: `Reduza gastos com ${categoryName} para economizar R$ ${potentialSavings.toFixed(
          2
        )}`,
      };
    }
  }

  return null;
};

/**
 * Gera insights mensais automáticos
 * @param {string} userId - ID do usuário
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Promise<Array>} Lista de insights
 */
export const generateMonthlyInsights = async (userId, month, year) => {
  try {
    const insights = [];

    // Buscar dados
    const expenses = await getExpenses(userId, month, year);
    const incomes = await getIncomes(userId, month, year);

    // Mês anterior
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;
    const previousExpenses = await getExpenses(userId, previousMonth, previousYear);

    const totalExpenses = sumArray(expenses, 'amount');
    const totalIncome = sumArray(incomes, 'amount');
    const previousTotal = sumArray(previousExpenses, 'amount');

    // Insight 1: Taxa de poupança
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      insights.push({
        type: 'savings_rate',
        icon: '💰',
        title: 'Taxa de Poupança',
        message: `Você poupou ${savingsRate.toFixed(1)}% da sua renda este mês`,
        severity: savingsRate > 20 ? 'success' : savingsRate > 10 ? 'warning' : 'error',
        value: savingsRate,
      });
    }

    // Insight 2: Comparação com mês anterior
    if (previousTotal > 0) {
      const difference = totalExpenses - previousTotal;
      const percentChange = (difference / previousTotal) * 100;

      if (Math.abs(percentChange) > 10) {
        insights.push({
          type: 'month_comparison',
          icon: difference > 0 ? '📈' : '📉',
          title: 'Tendência de Gastos',
          message:
            difference > 0
              ? `Você gastou ${percentChange.toFixed(1)}% a mais que o mês anterior`
              : `Você economizou ${Math.abs(percentChange).toFixed(
                  1
                )}% comparado ao mês anterior`,
          severity: difference > 0 ? 'warning' : 'success',
          value: percentChange,
        });
      }
    }

    // Insight 3: Categoria que mais cresceu
    if (expenses.length > 0 && previousExpenses.length > 0) {
      const categoryGrowth = analyzeCategoryGrowth(expenses, previousExpenses);
      const topGrowing = categoryGrowth[0];

      if (topGrowing && topGrowing.growth > 20) {
        insights.push({
          type: 'category_growth',
          icon: '🔺',
          title: 'Categoria em Alta',
          message: `${topGrowing.categoryName} aumentou ${topGrowing.growth.toFixed(1)}%`,
          severity: 'warning',
          value: topGrowing.growth,
          category: topGrowing.category,
        });
      }
    }

    // Insight 4: Maior gasto individual
    if (expenses.length > 0 && totalExpenses > 0) {
      const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
      const topExpense = sortedExpenses[0];
      const topExpensePercent = (topExpense.amount / totalExpenses) * 100;

      if (topExpensePercent > 20) {
        insights.push({
          type: 'top_expense',
          icon: '💸',
          title: 'Maior Gasto',
          message: `${topExpense.description} representou ${topExpensePercent.toFixed(
            1
          )}% dos seus gastos`,
          severity: 'info',
          value: topExpense.amount,
        });
      }
    }

    // Insight 5: Progresso de metas
    try {
      const goals = await getGoals(userId);

      goals.forEach(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const deadline = goal.deadline?.toDate ? goal.deadline.toDate() : new Date(goal.deadline);
        const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

        if (progress >= 100) {
          insights.push({
            type: 'goal_completed',
            icon: '🎉',
            title: 'Meta Alcançada!',
            message: `Parabéns! Você completou: ${goal.name}`,
            severity: 'success',
            goalId: goal.id,
          });
        } else if (daysLeft <= 7 && daysLeft > 0 && progress < 80) {
          insights.push({
            type: 'goal_at_risk',
            icon: '⚠️',
            title: 'Meta em Risco',
            message: `${goal.name}: faltam ${daysLeft} dias e você está em ${progress.toFixed(
              0
            )}%`,
            severity: 'warning',
            goalId: goal.id,
          });
        }
      });
    } catch (error) {
      console.warn('Erro ao buscar metas para insights:', error);
    }

    // Insight 6: Oportunidade de economia
    if (expenses.length > 0 && incomes.length > 0) {
      const opportunity = findSavingsOpportunity(expenses, incomes);
      if (opportunity) {
        insights.push({
          type: 'savings_opportunity',
          icon: '💡',
          title: 'Dica de Economia',
          message: opportunity.message,
          severity: 'info',
          potentialSavings: opportunity.amount,
          category: opportunity.category,
        });
      }
    }

    // Insight 7: Sem despesas registradas
    if (expenses.length === 0) {
      insights.push({
        type: 'no_expenses',
        icon: '📝',
        title: 'Nenhuma Despesa',
        message: 'Você ainda não registrou despesas este mês',
        severity: 'info',
      });
    }

    // Insight 8: Gastou mais que ganhou
    if (totalIncome > 0 && totalExpenses > totalIncome) {
      const deficit = totalExpenses - totalIncome;
      insights.push({
        type: 'deficit',
        icon: '⚠️',
        title: 'Déficit Mensal',
        message: `Você gastou R$ ${deficit.toFixed(2)} a mais do que ganhou`,
        severity: 'error',
        value: deficit,
      });
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return [];
  }
};

/**
 * Gera insights para o mês atual
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de insights
 */
export const generateCurrentMonthInsights = async userId => {
  const now = new Date();
  return generateMonthlyInsights(userId, now.getMonth() + 1, now.getFullYear());
};

/**
 * Filtra insights por severidade
 * @param {Array} insights - Lista de insights
 * @param {string} severity - Severidade (success, warning, error, info)
 * @returns {Array} Insights filtrados
 */
export const filterInsightsBySeverity = (insights, severity) => {
  return insights.filter(insight => insight.severity === severity);
};

/**
 * Ordena insights por prioridade
 * @param {Array} insights - Lista de insights
 * @returns {Array} Insights ordenados
 */
export const sortInsightsByPriority = insights => {
  const priorityOrder = { error: 1, warning: 2, info: 3, success: 4 };
  return [...insights].sort((a, b) => {
    return priorityOrder[a.severity] - priorityOrder[b.severity];
  });
};
