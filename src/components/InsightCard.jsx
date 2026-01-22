import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de Card de Insight
 * Exibe um insight financeiro com ações contextuais
 */
const InsightCard = ({ insight }) => {
  const navigate = useNavigate();

  // Cores por severidade
  const severityStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      iconBg: 'bg-green-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      iconBg: 'bg-red-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      iconBg: 'bg-blue-100',
    },
  };

  const styles = severityStyles[insight.severity] || severityStyles.info;

  // Ações contextuais por tipo
  const renderAction = () => {
    switch (insight.type) {
      case 'savings_opportunity':
      case 'category_growth':
        return (
          <button
            onClick={() => navigate(`/expenses?category=${insight.category}`)}
            className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              insight.severity === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : insight.severity === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Ver Gastos
          </button>
        );

      case 'goal_at_risk':
      case 'goal_completed':
        return (
          <button
            onClick={() => navigate('/goals')}
            className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              insight.severity === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
          >
            Ver Metas
          </button>
        );

      case 'deficit':
        return (
          <button
            onClick={() => navigate('/expenses')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Reduzir Gastos
          </button>
        );

      case 'no_expenses':
        return (
          <button
            onClick={() => navigate('/expenses')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Adicionar Despesa
          </button>
        );

      case 'month_comparison':
        return (
          <button
            onClick={() => navigate('/reports')}
            className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              insight.severity === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
          >
            Ver Relatório
          </button>
        );

      case 'top_expense':
        return (
          <button
            onClick={() => navigate('/expenses')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Ver Despesas
          </button>
        );

      case 'savings_rate':
        return (
          <button
            onClick={() => navigate('/reports')}
            className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              insight.severity === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : insight.severity === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            Ver Análise
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.bg} ${styles.border} border-l-4 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6`}
    >
      {/* Ícone e Título */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className={`${styles.iconBg} shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl`}
        >
          {insight.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${styles.text} mb-1`}>{insight.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{insight.message}</p>
        </div>
      </div>

      {/* Valor adicional (se disponível) */}
      {insight.value !== undefined && (
        <div className={`mt-3 pt-3 border-t ${styles.border} border-opacity-30`}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Valor:</span>{' '}
            {typeof insight.value === 'number' && insight.value >= 0
              ? insight.value.toFixed(2)
              : insight.value}
          </p>
        </div>
      )}

      {/* Ação contextual */}
      {renderAction()}
    </div>
  );
};

InsightCard.propTypes = {
  insight: PropTypes.shape({
    type: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
    value: PropTypes.number,
    category: PropTypes.string,
    goalId: PropTypes.string,
    potentialSavings: PropTypes.number,
  }).isRequired,
};

export default InsightCard;
