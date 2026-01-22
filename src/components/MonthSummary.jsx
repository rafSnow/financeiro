import PropTypes from 'prop-types';

/**
 * Componente de resumo mensal
 * Exibe cards com estatísticas financeiras do mês e comparação com o mês anterior
 */
const MonthSummary = ({ currentMonth, previousMonth }) => {
  const { income = 0, expenses = 0, balance = 0, savingsRate = 0, monthName = '' } = currentMonth;

  const {
    income: prevIncome = 0,
    expenses: prevExpenses = 0,
    monthName: prevMonthName = '',
  } = previousMonth || {};

  // Calcular diferenças
  const expensesDiff = expenses - prevExpenses;
  const incomeDiff = income - prevIncome;

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
   * Formata percentual
   */
  const formatPercentage = value => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Componente de card estatístico
   */
  const StatCard = ({ title, value, color, subtext, icon }) => {
    const colorClasses = {
      green:
        'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      red: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
      purple:
        'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${colorClasses[color] || colorClasses.blue}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
          </div>
          {icon && <div className="text-3xl ml-2">{icon}</div>}
        </div>
      </div>
    );
  };

  /**
   * Componente de comparação
   */
  const ComparisonRow = ({ label, current, previous }) => {
    const diff = current - previous;
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    // Para gastos, aumento é negativo (vermelho), redução é positivo (verde)
    // Para renda, aumento é positivo (verde), redução é negativo (vermelho)
    const isExpense = label === 'Gastos';
    const color = isNeutral
      ? 'text-gray-600 dark:text-gray-400'
      : isExpense
        ? isPositive
          ? 'text-red-600 dark:text-red-400'
          : 'text-green-600 dark:text-green-400'
        : isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400';

    const arrow = isNeutral ? '→' : isPositive ? '↑' : '↓';
    const diffPercentage = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">{formatCurrency(previous)}</span>
          <span className={`font-semibold ${color}`}>
            {arrow} {formatCurrency(Math.abs(diff))}
          </span>
          <span className={`text-sm ${color}`}>({diffPercentage}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Resumo de {monthName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão geral das suas finanças do mês
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Renda Total"
          value={formatCurrency(income)}
          color="green"
          icon="💰"
          subtext={
            incomeDiff !== 0
              ? `${incomeDiff > 0 ? '+' : ''}${formatCurrency(incomeDiff)} vs mês anterior`
              : null
          }
        />

        <StatCard
          title="Gastos Totais"
          value={formatCurrency(expenses)}
          color="red"
          icon="💸"
          subtext={
            expensesDiff !== 0
              ? `${expensesDiff > 0 ? '+' : ''}${formatCurrency(expensesDiff)} vs mês anterior`
              : null
          }
        />

        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(balance)}
          color={balance >= 0 ? 'blue' : 'red'}
          icon={balance >= 0 ? '✅' : '⚠️'}
          subtext={balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
        />

        <StatCard
          title="Taxa de Poupança"
          value={formatPercentage(savingsRate)}
          color={savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'blue' : 'purple'}
          icon="📊"
          subtext={
            savingsRate >= 20 ? 'Ótima taxa!' : savingsRate >= 10 ? 'Boa taxa' : 'Pode melhorar'
          }
        />
      </div>

      {/* Comparação com mês anterior */}
      {previousMonth && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Comparado a {prevMonthName}:
          </h3>

          <div className="space-y-1">
            <ComparisonRow label="Renda" current={income} previous={prevIncome} />
            <ComparisonRow label="Gastos" current={expenses} previous={prevExpenses} />
          </div>

          {/* Mensagem de feedback */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {expensesDiff < 0 ? (
              <p className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                <span>🎉</span>
                <span>
                  Parabéns! Você economizou {formatCurrency(Math.abs(expensesDiff))} este mês!
                </span>
              </p>
            ) : expensesDiff > 0 ? (
              <p className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>Atenção! Você gastou {formatCurrency(expensesDiff)} a mais este mês.</span>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                <span>→</span>
                <span>Seus gastos se mantiveram estáveis este mês.</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MonthSummary.propTypes = {
  currentMonth: PropTypes.shape({
    income: PropTypes.number,
    expenses: PropTypes.number,
    balance: PropTypes.number,
    savingsRate: PropTypes.number,
    monthName: PropTypes.string,
  }).isRequired,
  previousMonth: PropTypes.shape({
    income: PropTypes.number,
    expenses: PropTypes.number,
    monthName: PropTypes.string,
  }),
};

export default MonthSummary;
