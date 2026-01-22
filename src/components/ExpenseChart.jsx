import PropTypes from 'prop-types';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, getCategoryById } from '../utils/constants';

/**
 * Tooltip customizado para o gráfico
 */
const CustomTooltip = ({ active, payload, chartData }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{percentage}% do total</p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  chartData: PropTypes.array.isRequired,
};

/**
 * Componente de gráfico de pizza para despesas por categoria
 */
const ExpenseChart = ({ expenses }) => {
  // Agrupar despesas por categoria
  const groupedData = expenses.reduce((acc, expense) => {
    const category = expense.category || 'outros';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount || 0;
    return acc;
  }, {});

  // Converter para formato do recharts
  const chartData = Object.entries(groupedData).map(([categoryId, value]) => {
    const category = getCategoryById(categoryId);
    return {
      name: category.name,
      value: value,
      color: category.color,
      icon: category.icon,
    };
  });

  // Ordenar por valor (maior para menor)
  chartData.sort((a, b) => b.value - a.value);

  // Se não houver dados, mostrar mensagem
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-lg font-medium">Nenhuma despesa registrada</p>
        <p className="text-sm mt-1">Adicione suas primeiras despesas para visualizar o gráfico</p>
      </div>
    );
  }

  // Label customizado
  const renderLabel = entry => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((entry.value / total) * 100).toFixed(0);
    // Só mostra o label se for maior que 5%
    return percentage > 5 ? `${percentage}%` : '';
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip chartData={chartData} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={value => {
              const item = chartData.find(d => d.name === value);
              return (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item?.icon} {value}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Lista de categorias com valores */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => {
          const total = chartData.reduce((sum, d) => sum + d.value, 0);
          const percentage = ((item.value / total) * 100).toFixed(1);

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{percentage}% do total</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ExpenseChart.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      amount: PropTypes.number,
    })
  ).isRequired,
};

export default ExpenseChart;
