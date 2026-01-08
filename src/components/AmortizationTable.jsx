import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatCurrency } from '../utils/constants';

/**
 * Tabela de amortização detalhada
 * Mostra mês a mês a evolução da dívida com juros e principal
 * @param {Object} props
 * @param {Array} props.history - Histórico de amortização da simulação
 * @param {number} props.maxRows - Número máximo de linhas a exibir
 */
const AmortizationTable = ({ history, maxRows = 12 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!history || history.length === 0) {
    return null;
  }

  const displayedHistory = showAll ? history : history.slice(0, maxRows);
  const hasMore = history.length > maxRows;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          <span>Tabela de Amortização</span>
          <span className="text-xs font-normal text-gray-500">
            ({history.length} {history.length === 1 ? 'mês' : 'meses'})
          </span>
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mês</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Pagamento</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Juros</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Principal</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedHistory.map((row, index) => {
              const isLastRow = row.remaining === 0;
              const isFirstRow = index === 0;

              return (
                <tr
                  key={row.month}
                  className={`hover:bg-gray-50 transition-colors ${
                    isLastRow ? 'bg-green-50 font-semibold' : ''
                  } ${isFirstRow ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-900">
                    {row.month}
                    {isFirstRow && (
                      <span className="ml-2 text-xs text-blue-600 font-semibold">Atual</span>
                    )}
                    {isLastRow && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">✓ Quitado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.payment)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatCurrency(row.interest)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {formatCurrency(row.principal)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(row.remaining)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAll ? (
              <>
                <span>↑ Mostrar menos</span>
              </>
            ) : (
              <>
                <span>↓ Mostrar todos os {history.length} meses</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Totais */}
      <div className="bg-gray-100 px-4 py-3 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Pago</p>
            <p className="font-bold text-gray-900">
              {formatCurrency(history.reduce((sum, row) => sum + row.payment, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Juros</p>
            <p className="font-bold text-red-600">
              {formatCurrency(history.reduce((sum, row) => sum + row.interest, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Principal</p>
            <p className="font-bold text-green-600">
              {formatCurrency(history.reduce((sum, row) => sum + row.principal, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

AmortizationTable.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.number.isRequired,
      payment: PropTypes.number.isRequired,
      interest: PropTypes.number.isRequired,
      principal: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    })
  ).isRequired,
  maxRows: PropTypes.number,
};

export default AmortizationTable;
