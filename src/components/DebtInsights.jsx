import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { formatCurrency } from '../utils/constants';
import { calculateMonthlyInterest } from '../utils/debtCalculations';
import { calculateSavings, simulateDebtPayoff } from '../utils/simulator';

/**
 * DebtInsights - Card com insights automáticos sobre dívidas
 * Analisa as dívidas e fornece recomendações personalizadas
 */
const DebtInsights = ({ debts }) => {
  const insights = useMemo(() => {
    const activeDebts = debts.filter(d => d.status === 'active');

    if (activeDebts.length === 0) {
      return {
        hasDebts: false,
        insights: [],
      };
    }

    // Calcular métricas principais
    const totalMonthlyInterest = calculateMonthlyInterest(activeDebts);
    const totalDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

    // Encontrar dívida prioritária (menor saldo)
    const priorityDebt = [...activeDebts].sort((a, b) => a.remainingAmount - b.remainingAmount)[0];

    // Encontrar dívida com maior taxa de juros
    const highestInterestDebt = [...activeDebts].sort((a, b) => b.interestRate - a.interestRate)[0];

    // Calcular impacto de pagamento extra
    const extraPaymentSimulation = calculateSavings(priorityDebt, 0, 200);

    // Gerar insights
    const generatedInsights = [];

    // Insight 1: Juros mensais
    if (totalMonthlyInterest > 0) {
      const annualInterest = totalMonthlyInterest * 12;
      const severity =
        totalMonthlyInterest > 500 ? 'high' : totalMonthlyInterest > 200 ? 'medium' : 'low';

      generatedInsights.push({
        id: 'monthly-interest',
        icon: severity === 'high' ? '😱' : severity === 'medium' ? '😰' : '💸',
        title: 'Juros Mensais',
        message: `Você está pagando ${formatCurrency(totalMonthlyInterest)} em juros todo mês`,
        detail: `Isso representa ${formatCurrency(annualInterest)} por ano`,
        severity,
        color: severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'yellow',
      });
    }

    // Insight 2: Impacto de pagamento extra
    if (extraPaymentSimulation.monthsSaved > 0) {
      generatedInsights.push({
        id: 'extra-payment',
        icon: '💰',
        title: 'Oportunidade de Economia',
        message: `Pagando +${formatCurrency(200)}/mês na dívida prioritária, você quita ${
          extraPaymentSimulation.monthsSaved
        } ${extraPaymentSimulation.monthsSaved === 1 ? 'mês' : 'meses'} antes`,
        detail: `Economizando ${formatCurrency(extraPaymentSimulation.interestSavings)} em juros`,
        severity: 'info',
        color: 'blue',
      });
    }

    // Insight 3: Dívida com maior juros
    if (highestInterestDebt && highestInterestDebt.interestRate > 0) {
      const simulation = simulateDebtPayoff(highestInterestDebt, 0);
      const interestPercentage =
        (simulation.totalInterest / highestInterestDebt.remainingAmount) * 100;

      generatedInsights.push({
        id: 'highest-interest',
        icon: interestPercentage > 50 ? '🔴' : interestPercentage > 25 ? '🟡' : '🟢',
        title: 'Atenção aos Juros',
        message: `"${highestInterestDebt.name}" vai custar ${formatCurrency(
          simulation.totalInterest
        )} em juros`,
        detail: `Isso é ${interestPercentage.toFixed(0)}% do valor principal (${
          highestInterestDebt.interestRate
        }% ao ano)`,
        severity: interestPercentage > 50 ? 'high' : interestPercentage > 25 ? 'medium' : 'low',
        color: interestPercentage > 50 ? 'red' : interestPercentage > 25 ? 'yellow' : 'green',
      });
    }

    // Insight 4: Recomendação de priorização
    if (priorityDebt) {
      const monthsToPayoff = simulateDebtPayoff(priorityDebt, 0).months;

      generatedInsights.push({
        id: 'priority',
        icon: '🎯',
        title: 'Priorize Agora',
        message: `Concentre-se em quitar: "${priorityDebt.name}"`,
        detail: `Saldo de ${formatCurrency(
          priorityDebt.remainingAmount
        )} - Quitação em ${monthsToPayoff} ${monthsToPayoff === 1 ? 'mês' : 'meses'}`,
        severity: 'success',
        color: 'green',
      });
    }

    // Insight 5: Progresso geral
    const totalPaid = debts.filter(d => d.status === 'paid').length;
    if (totalPaid > 0) {
      generatedInsights.push({
        id: 'progress',
        icon: '🏆',
        title: 'Você está no Caminho Certo!',
        message: `Você já quitou ${totalPaid} ${totalPaid === 1 ? 'dívida' : 'dívidas'}`,
        detail: 'Continue firme no seu plano de pagamentos!',
        severity: 'success',
        color: 'green',
      });
    }

    return {
      hasDebts: true,
      insights: generatedInsights,
      totalMonthlyInterest,
      totalDebt,
      priorityDebt,
    };
  }, [debts]);

  if (!insights.hasDebts) {
    return null;
  }

  const getColorClasses = color => {
    const colors = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        detail: 'text-red-700',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        detail: 'text-orange-700',
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        detail: 'text-yellow-700',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        detail: 'text-blue-700',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        detail: 'text-green-700',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="text-xl font-bold text-gray-900">Insights Personalizados</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.insights.map(insight => {
          const colorClasses = getColorClasses(insight.color);

          return (
            <div
              key={insight.id}
              className={`rounded-xl border-2 p-5 transition-all hover:shadow-md ${colorClasses.bg} ${colorClasses.border}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold mb-1 ${colorClasses.text}`}>{insight.title}</h4>
                  <p className={`text-sm font-medium mb-2 ${colorClasses.text}`}>
                    {insight.message}
                  </p>
                  {insight.detail && (
                    <p className={`text-xs ${colorClasses.detail}`}>{insight.detail}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de ação rápida */}
      <div className="bg-linear-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <h4 className="font-bold text-lg mb-2">Próximos Passos</h4>
            <ul className="space-y-2 text-sm text-purple-100">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>
                  Use o <strong>Simulador</strong> para planejar pagamentos extras
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Priorize a dívida de menor saldo (Método Bola de Neve)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Registre todos os pagamentos para acompanhar seu progresso</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

DebtInsights.propTypes = {
  debts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      remainingAmount: PropTypes.number.isRequired,
      installmentValue: PropTypes.number.isRequired,
      interestRate: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DebtInsights;
