import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatCurrency } from '../utils/constants';
import Button from './Button';
import Modal from './Modal';

/**
 * Modal para registro de pagamento de dívida
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {function} props.onClose - Função para fechar o modal
 * @param {object} props.debt - Objeto da dívida a ser paga
 * @param {function} props.onConfirm - Função para confirmar o pagamento
 */
const PaymentModal = ({ isOpen, onClose, debt, onConfirm }) => {
  const [amount, setAmount] = useState(debt?.installmentValue || 0);
  const [isExtra, setIsExtra] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!debt) return null;

  // Calcular impacto do pagamento
  const newRemainingAmount = Math.max(0, debt.remainingAmount - amount);
  const willBePaidOff = newRemainingAmount <= 0;

  // Calcular juros mensais aproximados
  const monthlyInterestRate = debt.interestRate / 12 / 100;
  const currentMonthlyInterest = debt.remainingAmount * monthlyInterestRate;
  const newMonthlyInterest = newRemainingAmount * monthlyInterestRate;
  const interestSaved = currentMonthlyInterest - newMonthlyInterest;

  // Calcular parcelas restantes aproximadas
  const newPaidInstallments = isExtra ? debt.paidInstallments : debt.paidInstallments + 1;
  const newRemainingInstallments = debt.totalInstallments - newPaidInstallments;

  const handleConfirm = async () => {
    if (amount <= 0) {
      alert('O valor do pagamento deve ser maior que zero!');
      return;
    }

    if (amount > debt.remainingAmount + 100) {
      const confirm = window.confirm(
        'O valor do pagamento é maior que o saldo restante. Deseja continuar?'
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      await onConfirm({
        amount: Number(amount),
        isExtra,
        notes,
      });
      // Resetar form
      setAmount(debt.installmentValue || 0);
      setIsExtra(false);
      setNotes('');
      onClose();
    } catch (error) {
      alert('Erro ao processar pagamento. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💳 Registrar Pagamento">
      <div className="space-y-6">
        {/* Informações da dívida */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{debt.name}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Saldo Restante</p>
              <p className="font-bold text-lg text-red-600 dark:text-red-400">
                {formatCurrency(debt.remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Parcela Mensal</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {formatCurrency(debt.installmentValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Tipo de pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Pagamento
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIsExtra(false);
                setAmount(debt.installmentValue);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                !isExtra
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">📅</div>
              <div className="font-semibold text-gray-900 dark:text-white">Parcela Mensal</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pagamento normal</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExtra(true);
                setAmount(0);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                isExtra
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">💰</div>
              <div className="font-semibold text-gray-900 dark:text-white">Pagamento Extra</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Amortização adicional
              </div>
            </button>
          </div>
        </div>

        {/* Valor do pagamento */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Valor do Pagamento (R$)
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="0,00"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAmount(debt.installmentValue)}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
            >
              Parcela ({formatCurrency(debt.installmentValue)})
            </button>
            <button
              type="button"
              onClick={() => setAmount(debt.remainingAmount)}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
            >
              Quitar tudo ({formatCurrency(debt.remainingAmount)})
            </button>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            rows="3"
            placeholder="Ex: Pagamento com 13º salário, antecipação, etc."
          />
        </div>

        {/* Preview do impacto */}
        {amount > 0 && (
          <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>Impacto do Pagamento</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Novo saldo:</span>
                <span
                  className={`font-bold ${willBePaidOff ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}
                >
                  {willBePaidOff ? '✅ QUITADA!' : formatCurrency(newRemainingAmount)}
                </span>
              </div>
              {!willBePaidOff && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Parcelas restantes:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {newRemainingInstallments} de {debt.totalInstallments}
                    </span>
                  </div>
                  {debt.interestRate > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Economia de juros/mês:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatCurrency(interestSaved)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={loading} className="flex-1">
            {willBePaidOff ? '🎉 Quitar Dívida' : '💳 Confirmar Pagamento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  debt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    remainingAmount: PropTypes.number.isRequired,
    installmentValue: PropTypes.number.isRequired,
    totalInstallments: PropTypes.number.isRequired,
    paidInstallments: PropTypes.number.isRequired,
    interestRate: PropTypes.number,
  }),
  onConfirm: PropTypes.func.isRequired,
};

export default PaymentModal;
