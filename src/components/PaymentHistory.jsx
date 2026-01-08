import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getPaymentHistory } from '../services/debtPayments.service';
import { formatCurrency } from '../utils/constants';

/**
 * Componente para exibir histórico de pagamentos de uma dívida
 * @param {Object} props
 * @param {string} props.debtId - ID da dívida
 * @param {string} props.debtName - Nome da dívida
 */
const PaymentHistory = ({ debtId, debtName }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      if (!debtId) return;

      setLoading(true);
      try {
        const data = await getPaymentHistory(debtId);
        setPayments(data);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [debtId]);

  // Calcular total pago
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span>
          <span>Histórico de Pagamentos</span>
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-gray-500">Nenhum pagamento registrado ainda</p>
          <p className="text-sm text-gray-400 mt-2">
            Os pagamentos aparecerão aqui quando forem realizados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          <span>Histórico de Pagamentos</span>
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Pago</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {debtName && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
          <p className="text-sm font-medium text-gray-900">{debtName}</p>
        </div>
      )}

      <div className="space-y-3">
        {payments.map(payment => {
          const date = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date);
          const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const formattedTime = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={payment.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      payment.isExtra ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <span className="text-xl">{payment.isExtra ? '💰' : '📅'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {formattedDate} às {formattedTime}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.isExtra ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {payment.isExtra ? 'Extra' : 'Mensal'}
                </span>
              </div>
              {payment.notes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">{payment.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estatísticas */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total de Pagamentos</p>
            <p className="text-lg font-bold text-gray-900">{payments.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Pagamentos Extras</p>
            <p className="text-lg font-bold text-green-600">
              {payments.filter(p => p.isExtra).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Valor Médio</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totalPaid / payments.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

PaymentHistory.propTypes = {
  debtId: PropTypes.string.isRequired,
  debtName: PropTypes.string,
};

export default PaymentHistory;
