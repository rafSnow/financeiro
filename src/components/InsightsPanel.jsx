import PropTypes from 'prop-types';

/**
 * Painel de insights automáticos
 * Gera dicas e observações sobre os dados financeiros
 */
const InsightsPanel = ({ currentData, previousData, goals = [] }) => {
  const { income = 0, expenses = 0, balance = 0, savingsRate = 0, categories = [] } = currentData;
  const { expenses: prevExpenses = 0 } = previousData || {};

  /**
   * Formata valor para moeda brasileira
   */
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Gera insights automáticos
   */
  const generateInsights = () => {
    const insights = [];

    // Insight 1: Maior categoria de gasto
    if (categories.length > 0) {
      const topCategory = categories[0];
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Maior Gasto',
        message: `Sua maior despesa é com ${topCategory.name}: ${
          topCategory.percentage
        }% do total (${formatCurrency(topCategory.value)})`,
      });
    }

    // Insight 2: Comparação com mês anterior
    if (prevExpenses > 0) {
      const diff = expenses - prevExpenses;
      const diffPercent = ((diff / prevExpenses) * 100).toFixed(1);

      if (diff < 0) {
        insights.push({
          type: 'success',
          icon: '🎉',
          title: 'Economia Alcançada',
          message: `Você economizou ${formatCurrency(Math.abs(diff))} (${Math.abs(
            diffPercent
          )}%) em relação ao mês anterior!`,
        });
      } else if (diff > 0) {
        insights.push({
          type: 'warning',
          icon: '📈',
          title: 'Aumento nos Gastos',
          message: `Seus gastos aumentaram ${formatCurrency(
            diff
          )} (${diffPercent}%) em relação ao mês anterior.`,
        });
      }
    }

    // Insight 3: Taxa de poupança
    if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: 'Excelente Taxa de Poupança',
        message: `Parabéns! Você está poupando ${savingsRate.toFixed(
          1
        )}% da sua renda. Continue assim!`,
      });
    } else if (savingsRate >= 10) {
      insights.push({
        type: 'info',
        icon: '💡',
        title: 'Boa Taxa de Poupança',
        message: `Você está poupando ${savingsRate.toFixed(
          1
        )}% da sua renda. Tente aumentar para pelo menos 20%.`,
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Taxa de Poupança Baixa',
        message: `Você está poupando apenas ${savingsRate.toFixed(
          1
        )}% da sua renda. Tente reduzir gastos para poupar mais.`,
      });
    } else if (balance < 0) {
      insights.push({
        type: 'error',
        icon: '🚨',
        title: 'Gastando Mais que Ganha',
        message: `Atenção! Você está gastando ${formatCurrency(
          Math.abs(balance)
        )} a mais do que sua renda. Revise seus gastos urgentemente.`,
      });
    }

    // Insight 4: Oportunidade de economia
    if (categories.length >= 2) {
      const secondCategory = categories[1];
      const potentialSavings = secondCategory.value * 0.2; // 20% de redução

      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Oportunidade de Economia',
        message: `Reduzindo 20% dos gastos com ${
          secondCategory.name
        }, você economizaria ${formatCurrency(potentialSavings)} por mês.`,
      });
    }

    // Insight 5: Progresso de metas
    if (goals.length > 0) {
      const activeGoals = goals.filter(g => g.status === 'active');
      if (activeGoals.length > 0) {
        const closestToComplete = activeGoals
          .map(g => ({
            ...g,
            percentage: (g.currentAmount / g.targetAmount) * 100,
          }))
          .sort((a, b) => b.percentage - a.percentage)[0];

        if (closestToComplete.percentage >= 75) {
          insights.push({
            type: 'success',
            icon: '🎯',
            title: 'Meta Quase Completa',
            message: `Você está a ${(100 - closestToComplete.percentage).toFixed(
              0
            )}% de completar a meta "${closestToComplete.name}"! Falta apenas ${formatCurrency(
              closestToComplete.targetAmount - closestToComplete.currentAmount
            )}.`,
          });
        } else if (balance > 0 && activeGoals.length > 0) {
          insights.push({
            type: 'info',
            icon: '🎯',
            title: 'Contribua para suas Metas',
            message: `Você tem ${formatCurrency(
              balance
            )} de sobra este mês. Que tal investir em suas ${activeGoals.length} meta(s) ativa(s)?`,
          });
        }
      }
    }

    // Insight 6: Gastos vs Renda
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
    if (expenseRatio >= 80 && expenseRatio < 100) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Gastos Elevados',
        message: `Você está usando ${expenseRatio.toFixed(
          0
        )}% da sua renda. Considere criar um orçamento mais restrito.`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  /**
   * Retorna classes CSS baseadas no tipo
   */
  const getTypeClasses = type => {
    const classes = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-orange-50 border-orange-200 text-orange-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      tip: 'bg-purple-50 border-purple-200 text-purple-800',
    };
    return classes[type] || classes.info;
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum insight disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div key={index} className={`p-4 rounded-lg border-2 ${getTypeClasses(insight.type)}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{insight.icon}</span>
            <div className="flex-1">
              <h5 className="font-semibold mb-1">{insight.title}</h5>
              <p className="text-sm opacity-90">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

InsightsPanel.propTypes = {
  currentData: PropTypes.shape({
    income: PropTypes.number,
    expenses: PropTypes.number,
    balance: PropTypes.number,
    savingsRate: PropTypes.number,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.number,
        percentage: PropTypes.number,
      })
    ),
  }).isRequired,
  previousData: PropTypes.shape({
    expenses: PropTypes.number,
  }),
  goals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.string,
      currentAmount: PropTypes.number,
      targetAmount: PropTypes.number,
    })
  ),
};

export default InsightsPanel;
