import PropTypes from 'prop-types';
import { formatCurrency, formatDate, getCategoryById } from '../utils/constants';
import { hapticFeedback } from '../utils/haptics';

/**
 * Card de despesa
 * Exibe informações de uma despesa com ações de editar/excluir
 */
const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const category = getCategoryById(expense.category);

  const handleEdit = () => {
    hapticFeedback('light');
    onEdit(expense);
  };

  const handleDelete = () => {
    hapticFeedback('error');
    onDelete(expense);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-start gap-4" style={{ padding: '1.5rem' }}>
        {/* Ícone da categoria */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
          style={{ backgroundColor: category.color + '20' }}
        >
          <span className="text-2xl">{category.icon}</span>
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                {expense.description}
              </h3>
              <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category.name}</span>
                {expense.isFixed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    Fixa
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(expense.amount)}
              </p>
              <p
                className="text-xs text-gray-500 dark:text-gray-400"
                style={{ marginTop: '0.25rem' }}
              >
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Forma de pagamento */}
          {expense.paymentMethod && (
            <div style={{ marginTop: '0.75rem' }}>
              <span className="text-sm text-gray-600">
                {expense.paymentMethod === 'dinheiro' && '💵 Dinheiro'}
                {expense.paymentMethod === 'debito' && '💳 Débito'}
                {expense.paymentMethod === 'credito' && '💳 Crédito'}
                {expense.paymentMethod === 'pix' && '📱 PIX'}
                {expense.paymentMethod === 'transferencia' && '🏦 Transferência'}
                {expense.paymentMethod === 'boleto' && '📄 Boleto'}
              </span>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExpenseCard.propTypes = {
  expense: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.any.isRequired,
    category: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string,
    isFixed: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ExpenseCard;
