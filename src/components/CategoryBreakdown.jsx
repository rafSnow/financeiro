import PropTypes from 'prop-types';

/**
 * Componente de breakdown detalhado por categoria
 * Exibe tabela com todas as categorias e seus gastos
 */
const CategoryBreakdown = ({ expenses, totalExpenses }) => {
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
   * Agrupa gastos por categoria e calcula estatísticas
   */
  const getCategoryStats = () => {
    const categoryMap = {};

    expenses.forEach(expense => {
      const category = expense.category || 'Outros';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          total: 0,
          count: 0,
        };
      }
      categoryMap[category].total += expense.amount;
      categoryMap[category].count += 1;
    });

    // Converter para array e adicionar percentuais
    return Object.values(categoryMap)
      .map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
        average: cat.count > 0 ? cat.total / cat.count : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  /**
   * Retorna cor baseada no percentual
   */
  const getColorByPercentage = percentage => {
    if (percentage >= 30) return 'text-red-600 bg-red-50';
    if (percentage >= 15) return 'text-orange-600 bg-orange-50';
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  /**
   * Retorna ícone baseado no percentual
   */
  const getIconByPercentage = percentage => {
    if (percentage >= 30) return '🔴';
    if (percentage >= 15) return '🟡';
    return '🟢';
  };

  const categories = getCategoryStats();

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma categoria encontrada neste período</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Gastos</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Qtd</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Média</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{cat.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-gray-800">
                {formatCurrency(cat.total)}
              </td>
              <td className="py-3 px-4 text-right text-gray-600">{cat.count}</td>
              <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(cat.average)}</td>
              <td className="py-3 px-4 text-right">
                <span className={`font-semibold ${getColorByPercentage(cat.percentage)}`}>
                  {cat.percentage.toFixed(1)}%
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getColorByPercentage(
                    cat.percentage
                  )}`}
                  title={
                    cat.percentage >= 30
                      ? 'Alto impacto'
                      : cat.percentage >= 15
                      ? 'Médio impacto'
                      : cat.percentage >= 5
                      ? 'Baixo impacto'
                      : 'Muito baixo'
                  }
                >
                  {getIconByPercentage(cat.percentage)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
            <td className="py-3 px-4 text-gray-800">TOTAL</td>
            <td className="py-3 px-4 text-right text-gray-800">{formatCurrency(totalExpenses)}</td>
            <td className="py-3 px-4 text-right text-gray-600">{expenses.length}</td>
            <td className="py-3 px-4 text-right text-gray-600">
              {formatCurrency(expenses.length > 0 ? totalExpenses / expenses.length : 0)}
            </td>
            <td className="py-3 px-4 text-right text-gray-600">100%</td>
            <td className="py-3 px-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

CategoryBreakdown.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  totalExpenses: PropTypes.number.isRequired,
};

export default CategoryBreakdown;
