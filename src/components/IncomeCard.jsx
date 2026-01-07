import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../utils/constants';

/**
 * Card de Renda
 * Exibe informações de uma renda
 */
const IncomeCard = ({ income, onEdit, onDelete }) => {
  const typeConfig = {
    salary: { icon: '💼', label: 'Salário', color: 'bg-blue-100 text-blue-700' },
    extra: { icon: '💰', label: 'Renda Extra', color: 'bg-green-100 text-green-700' },
  };

  const config = typeConfig[income.type] || typeConfig.extra;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
      <div className="flex items-start justify-between">
        {/* Informações principais */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                income.type === 'salary' ? 'bg-blue-50' : 'bg-green-50'
              }`}
            >
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{income.description}</h3>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
              >
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(income.amount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📅</span>
              <span className="text-gray-700">{formatDate(income.date)}</span>
            </div>
            <div>
              {income.received ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  ✅ Recebido
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  ⏳ A receber
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(income)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(income)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

IncomeCard.propTypes = {
  income: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['salary', 'extra']).isRequired,
    date: PropTypes.object.isRequired,
    received: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default IncomeCard;
