import PropTypes from 'prop-types';

/**
 * Componente de top gastos
 * Exibe os maiores gastos individuais e categorias
 */
const TopExpenses = ({ expenses, previousExpenses = [] }) => {
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
   * Retorna os top 5 gastos individuais
   */
  const getTopIndividualExpenses = () => {
    return [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(exp => ({
        description: exp.description || 'Sem descrição',
        category: exp.category || 'Outros',
        amount: exp.amount,
        date: exp.date,
      }));
  };

  /**
   * Retorna as top 3 categorias por valor total
   */
  const getTopCategories = () => {
    const categoryMap = {};

    expenses.forEach(exp => {
      const category = exp.category || 'Outros';
      categoryMap[category] = (categoryMap[category] || 0) + exp.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  };

  /**
   * Retorna a categoria com maior crescimento
   */
  const getCategoryWithMostGrowth = () => {
    if (!previousExpenses || previousExpenses.length === 0) {
      return null;
    }

    // Mapear gastos atuais por categoria
    const currentMap = {};
    expenses.forEach(exp => {
      const category = exp.category || 'Outros';
      currentMap[category] = (currentMap[category] || 0) + exp.amount;
    });

    // Mapear gastos anteriores por categoria
    const previousMap = {};
    previousExpenses.forEach(exp => {
      const category = exp.category || 'Outros';
      previousMap[category] = (previousMap[category] || 0) + exp.amount;
    });

    // Calcular crescimento de cada categoria
    let maxGrowth = null;

    Object.keys(currentMap).forEach(category => {
      const current = currentMap[category];
      const previous = previousMap[category] || 0;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 100;

      if (!maxGrowth || growth > maxGrowth.growth) {
        maxGrowth = {
          name: category,
          current,
          previous,
          growth,
          difference: current - previous,
        };
      }
    });

    return maxGrowth;
  };

  const topIndividual = getTopIndividualExpenses();
  const topCategories = getTopCategories();
  const fastestGrowing = getCategoryWithMostGrowth();

  /**
   * Formata data
   */
  const formatDate = timestamp => {
    if (!timestamp || !timestamp.toDate) return '-';
    return timestamp.toDate().toLocaleDateString('pt-BR');
  };

  /**
   * Retorna emoji de medalha
   */
  const getMedal = index => {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return medals[index] || '';
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum gasto registrado neste período</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 5 Gastos Individuais */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>💸</span>
          <span>Top 5 Maiores Gastos</span>
        </h4>
        <div className="space-y-2">
          {topIndividual.map((expense, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">{getMedal(index)}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    {expense.category} • {formatDate(expense.date)}
                  </p>
                </div>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 Categorias */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>Top 3 Categorias</span>
        </h4>
        <div className="space-y-2">
          {topCategories.map((cat, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getMedal(index)}</span>
                <span className="font-medium text-gray-800">{cat.name}</span>
              </div>
              <span className="font-bold text-blue-600">{formatCurrency(cat.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categoria com Maior Crescimento */}
      {fastestGrowing && fastestGrowing.growth > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📈</span>
            <span>Maior Crescimento</span>
          </h4>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{fastestGrowing.name}</span>
              <span className="text-orange-600 font-bold">
                +{fastestGrowing.growth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Mês anterior: {formatCurrency(fastestGrowing.previous)}</span>
              <span>→</span>
              <span>Este mês: {formatCurrency(fastestGrowing.current)}</span>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Aumento de {formatCurrency(fastestGrowing.difference)} em relação ao mês anterior
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

TopExpenses.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      category: PropTypes.string,
      amount: PropTypes.number.isRequired,
      date: PropTypes.object,
    })
  ).isRequired,
  previousExpenses: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      amount: PropTypes.number.isRequired,
    })
  ),
};

export default TopExpenses;
