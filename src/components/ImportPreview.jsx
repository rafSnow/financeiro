import { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/constants';

/**
 * Componente de preview de transações antes de importar
 * Permite selecionar quais transações importar
 */
const ImportPreview = ({ transactions, onConfirm, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState(transactions.map(t => t.id));

  const handleToggleAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const handleToggle = id => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const selected = transactions.filter(t => selectedIds.includes(t.id));
    onConfirm(selected);
  };

  const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id));
  const totalExpenses = selectedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = selectedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Preview de Importação</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total de Transações</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {selectedIds.length} / {transactions.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Receitas</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Despesas</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Seleção */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.length === transactions.length}
            onChange={handleToggleAll}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecionar todas
          </span>
        </label>
      </div>

      {/* Tabela de transações */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto border dark:border-gray-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <span className="sr-only">Selecionar</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map(transaction => (
              <tr
                key={transaction.id}
                className={`
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  ${selectedIds.includes(transaction.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                `}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(transaction.id)}
                    onChange={() => handleToggle(transaction.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {transaction.description}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }
                    `}
                  >
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  <span
                    className={
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Importar {selectedIds.length} transaç{selectedIds.length === 1 ? 'ão' : 'ões'}
        </button>
      </div>
    </div>
  );
};

export default ImportPreview;
