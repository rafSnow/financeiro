import PropTypes from 'prop-types';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Gráfico de linhas para tendência de gastos
 */
const ExpensesTrendChart = ({ data }) => {
  /**
   * Formata valor para moeda brasileira (simplificado)
   */
  const formatCurrency = value => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value}`;
  };

  /**
   * Tooltip customizado
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-sm text-red-600">
            Gastos:{' '}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum dado disponível para o período</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 min-h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis tickFormatter={formatCurrency} stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Gastos"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

ExpensesTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      expenses: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ExpensesTrendChart;
