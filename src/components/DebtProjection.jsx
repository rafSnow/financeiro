import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { formatCurrency } from '../utils/constants';
import { calculatePayoffDate, simulateDebtPayoff } from '../utils/simulator';

/**
 * DebtProjection - Timeline visual de quitação de dívidas
 * Mostra marcos importantes e projeção de liberdade financeira
 */
const DebtProjection = ({ debts, extraPayment = 0 }) => {
  // Calcular projeções para cada dívida ativa
  const projections = useMemo(() => {
    const activeDebts = debts.filter(d => d.status === 'active');

    // Simular cada dívida individualmente
    const debtProjections = activeDebts.map(debt => {
      const simulation = simulateDebtPayoff(debt, extraPayment);
      const payoffDate = calculatePayoffDate(simulation.months);

      return {
        id: debt.id,
        name: debt.name,
        months: simulation.months,
        payoffDate,
        totalInterest: simulation.totalInterest,
        totalPaid: simulation.totalPaid,
        remainingAmount: debt.remainingAmount,
        priority: debt.priority || 0,
      };
    });

    // Ordenar por prioridade (menor número = maior prioridade)
    debtProjections.sort((a, b) => a.priority - b.priority);

    // Calcular marcos importantes
    const totalMonths = Math.max(...debtProjections.map(d => d.months), 0);
    const totalInterest = debtProjections.reduce((sum, d) => sum + d.totalInterest, 0);
    const totalDebt = debtProjections.reduce((sum, d) => sum + d.remainingAmount, 0);
    const freedomDate = calculatePayoffDate(totalMonths);

    return {
      debts: debtProjections,
      totalMonths,
      totalInterest,
      totalDebt,
      freedomDate,
      hasDebts: debtProjections.length > 0,
    };
  }, [debts, extraPayment]);

  if (!projections.hasDebts) {
    return (
      <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Parabéns!</h3>
        <p className="text-green-700">Você não tem dívidas ativas!</p>
      </div>
    );
  }

  const formatDate = date => {
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const formatMonthYear = date => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Card principal - Liberdade Financeira */}
      <div className="bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-5xl">🎯</div>
          <div>
            <h2 className="text-2xl font-bold">Sua Liberdade Financeira</h2>
            <p className="text-blue-100">Projeção de quitação total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">🗓️ Quitação Total</p>
            <p className="text-2xl font-bold">{formatMonthYear(projections.freedomDate)}</p>
            <p className="text-blue-100 text-sm mt-1">
              em {projections.totalMonths} {projections.totalMonths === 1 ? 'mês' : 'meses'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">💰 Total a Pagar</p>
            <p className="text-2xl font-bold">
              {formatCurrency(projections.totalDebt + projections.totalInterest)}
            </p>
            <p className="text-blue-100 text-sm mt-1">principal + juros</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">📈 Total de Juros</p>
            <p className="text-2xl font-bold">{formatCurrency(projections.totalInterest)}</p>
            <p className="text-blue-100 text-sm mt-1">
              {((projections.totalInterest / projections.totalDebt) * 100).toFixed(1)}% do principal
            </p>
          </div>
        </div>
      </div>

      {/* Timeline de Quitação */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📅</span>
          <h3 className="text-xl font-bold text-gray-900">Timeline de Quitação</h3>
        </div>

        <div className="space-y-4">
          {projections.debts.map((debt, index) => {
            const isFirst = index === 0;
            const isLast = index === projections.debts.length - 1;
            const monthsFromNow = debt.months;

            return (
              <div key={debt.id} className="relative pl-8">
                {/* Linha vertical */}
                {!isLast && (
                  <div className="absolute left-3.75 top-8 bottom-0 w-0.5 bg-linear-to-b from-blue-400 to-blue-200" />
                )}

                {/* Círculo do marco */}
                <div
                  className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    isFirst
                      ? 'bg-linear-to-br from-yellow-400 to-orange-500 text-white'
                      : isLast
                      ? 'bg-linear-to-br from-green-400 to-emerald-500 text-white'
                      : 'bg-linear-to-br from-blue-400 to-blue-500 text-white'
                  }`}
                >
                  {isFirst ? '🥇' : isLast ? '🎉' : '✓'}
                </div>

                {/* Conteúdo do marco */}
                <div
                  className={`ml-4 p-4 rounded-xl border-2 transition-all ${
                    isFirst
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{debt.name}</h4>
                        {isFirst && (
                          <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                            PRÓXIMA
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📅 <strong>{formatDate(debt.payoffDate)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {monthsFromNow} {monthsFromNow === 1 ? 'mês' : 'meses'}
                        </span>
                        <span className="flex items-center gap-1">
                          💵 {formatCurrency(debt.remainingAmount)}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Juros estimados: {formatCurrency(debt.totalInterest)}
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="hidden sm:block">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isFirst
                              ? 'bg-linear-to-r from-yellow-400 to-orange-500'
                              : 'bg-linear-to-r from-blue-400 to-blue-500'
                          }`}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">{debt.months}m</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Marco final - Liberdade */}
          <div className="relative pl-8 pt-4">
            <div className="absolute left-0 top-4 w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg text-white text-xl">
              🏆
            </div>

            <div className="ml-4 p-6 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-300">
              <h4 className="font-bold text-green-900 text-lg mb-2">🎉 Liberdade Financeira!</h4>
              <p className="text-green-700">
                Você estará <strong>livre de dívidas</strong> em{' '}
                <strong>{formatMonthYear(projections.freedomDate)}</strong>
              </p>
              <p className="text-sm text-green-600 mt-2">
                Continue firme no seu plano de pagamentos! 💪
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dica com pagamento extra */}
      {extraPayment === 0 && (
        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-purple-900 mb-2">Dica: Acelere sua quitação!</h4>
              <p className="text-purple-700 text-sm">
                Use o <strong>Simulador</strong> para ver como pagamentos extras podem reduzir o
                tempo de quitação e economizar em juros. Mesmo pequenos valores fazem diferença!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DebtProjection.propTypes = {
  debts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      remainingAmount: PropTypes.number.isRequired,
      installmentValue: PropTypes.number.isRequired,
      interestRate: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      priority: PropTypes.number,
    })
  ).isRequired,
  extraPayment: PropTypes.number,
};

export default DebtProjection;
