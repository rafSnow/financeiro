import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/constants';

/**
 * Card de Dívida
 * Exibe informações de uma dívida com barra de progresso
 */
const DebtCard = ({ debt, onPay, onEdit, onDelete, onSimulate }) => {
  const typeConfig = {
    credit_card: { icon: '💳', label: 'Cartão de Crédito', color: 'bg-purple-100 text-purple-700' },
    loan: { icon: '🏦', label: 'Empréstimo', color: 'bg-orange-100 text-orange-700' },
    financing: { icon: '🏠', label: 'Financiamento', color: 'bg-blue-100 text-blue-700' },
  };

  const config = typeConfig[debt.type] || typeConfig.loan;

  // Calcular progresso
  const progress = ((debt.paidInstallments / debt.totalInstallments) * 100).toFixed(0);
  const isPaid = debt.status === 'paid';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-shadow p-6 ${
        isPaid ? 'border-green-200 opacity-75' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Informações principais */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isPaid ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <span className="text-2xl">{isPaid ? '✅' : config.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{debt.name}</h3>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
              >
                {config.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Valor Restante</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(debt.remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Parcela Mensal</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(debt.installmentValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Juros</p>
              <p className="text-sm font-semibold text-orange-600">{debt.interestRate}% a.a.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Vencimento</p>
              <p className="text-sm font-semibold text-gray-700">Dia {debt.dueDay}</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">
                {debt.paidInstallments} de {debt.totalInstallments} parcelas pagas
              </span>
              <span className="text-xs font-semibold text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  isPaid ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {debt.priority && debt.priority < 999 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-xs font-medium text-gray-700">Prioridade {debt.priority}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {!isPaid && (
          <>
            <button
              onClick={() => onPay(debt)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pagar
            </button>
            {onSimulate && (
              <button
                onClick={() => onSimulate(debt)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                title="Simular quitação"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Simular
              </button>
            )}
          </>
        )}
        <button
          onClick={() => onEdit(debt)}
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
          onClick={() => onDelete(debt)}
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
  );
};

DebtCard.propTypes = {
  debt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    totalAmount: PropTypes.number.isRequired,
    remainingAmount: PropTypes.number.isRequired,
    installmentValue: PropTypes.number.isRequired,
    totalInstallments: PropTypes.number.isRequired,
    paidInstallments: PropTypes.number.isRequired,
    interestRate: PropTypes.number,
    dueDay: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['credit_card', 'loan', 'financing']).isRequired,
    priority: PropTypes.number,
    status: PropTypes.oneOf(['active', 'paid']).isRequired,
  }).isRequired,
  onPay: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSimulate: PropTypes.func,
};

export default DebtCard;
