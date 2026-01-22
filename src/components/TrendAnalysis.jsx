import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getExpenses } from '../services/expenses.service';
import { getIncomes } from '../services/income.service';
import { DEFAULT_CATEGORIES, formatCurrency } from '../utils/constants';

/**
 * Calcula tendência usando regressão linear simples
 * @param {Array<number>} values - Array de valores numéricos
 * @returns {Object} Objeto com direção, percentual e slope
 */
const calculateTrend = values => {
  if (values.length < 2) {
    return { direction: 'stable', percentage: 0, slope: 0 };
  }

  // Regressão linear simples
  const n = values.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + (x + 1) * y, 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgValue = sumY / n;
  const percentChange = avgValue > 0 ? (slope / avgValue) * 100 : 0;

  return {
    direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable',
    percentage: Math.abs(percentChange),
    slope,
  };
};

/**
 * Busca dados dos últimos 6 meses
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Array com dados mensais
 */
const getLast6MonthsData = async userId => {
  const data = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    try {
      const [expenses, incomes] = await Promise.all([
        getExpenses(userId, month, year),
        getIncomes(userId, month, year),
      ]);

      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const savings = totalIncome - totalExpenses;

      // Agrupar por categoria
      const byCategory = {};
      DEFAULT_CATEGORIES.forEach(cat => {
        byCategory[cat.id] = expenses
          .filter(e => e.category === cat.id)
          .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      });

      data.push({
        month,
        year,
        monthName: targetDate.toLocaleDateString('pt-BR', { month: 'short' }),
        totalExpenses,
        totalIncome,
        savings,
        byCategory,
      });
    } catch (error) {
      console.error(`Erro ao buscar dados de ${month}/${year}:`, error);
      data.push({
        month,
        year,
        monthName: targetDate.toLocaleDateString('pt-BR', { month: 'short' }),
        totalExpenses: 0,
        totalIncome: 0,
        savings: 0,
        byCategory: {},
      });
    }
  }

  return data;
};

/**
 * Componente de Card de Tendência
 */
const TrendCard = ({ title, trend, icon }) => {
  const directionConfig = {
    up: { color: 'text-red-600', icon: '📈', label: 'Aumentando' },
    down: { color: 'text-green-600', icon: '📉', label: 'Diminuindo' },
    stable: { color: 'text-gray-600', icon: '➡️', label: 'Estável' },
  };

  const config = directionConfig[trend.direction] || directionConfig.stable;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="text-2xl">{config.icon}</div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tendência:</span>
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Variação:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {trend.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

TrendCard.propTypes = {
  title: PropTypes.string.isRequired,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'stable']).isRequired,
    percentage: PropTypes.number.isRequired,
    slope: PropTypes.number.isRequired,
  }).isRequired,
  icon: PropTypes.string.isRequired,
};

/**
 * Componente de Linha de Tendência por Categoria
 */
const CategoryTrendRow = ({ category, trend }) => {
  const cat = DEFAULT_CATEGORIES.find(c => c.id === category);
  if (!cat) return null;

  const directionIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  };

  const directionColors = {
    up: 'text-red-600',
    down: 'text-green-600',
    stable: 'text-gray-600',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{cat.icon}</span>
        <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {trend.percentage.toFixed(1)}%
        </span>
        <span className={`text-xl ${directionColors[trend.direction]}`}>
          {directionIcons[trend.direction]}
        </span>
      </div>
    </div>
  );
};

CategoryTrendRow.propTypes = {
  category: PropTypes.string.isRequired,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'stable']).isRequired,
    percentage: PropTypes.number.isRequired,
  }).isRequired,
};

/**
 * Componente principal de Análise de Tendências
 */
const TrendAnalysis = ({ userId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeTrends = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const last6Months = await getLast6MonthsData(userId);

        const trends = {
          expenses: calculateTrend(last6Months.map(m => m.totalExpenses)),
          income: calculateTrend(last6Months.map(m => m.totalIncome)),
          savings: calculateTrend(last6Months.map(m => m.savings)),
          byCategory: {},
          monthlyData: last6Months,
        };

        // Tendência por categoria
        DEFAULT_CATEGORIES.forEach(category => {
          const values = last6Months.map(m => m.byCategory[category.id] || 0);
          trends.byCategory[category.id] = calculateTrend(values);
        });

        setTrendData(trends);
      } catch (error) {
        console.error('Erro ao analisar tendências:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeTrends();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Analisando tendências...</p>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Não foi possível carregar os dados de tendências
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📈 Análise de Tendências
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Análise dos últimos 6 meses</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendCard title="Gastos" trend={trendData.expenses} icon="💸" />
        <TrendCard title="Receitas" trend={trendData.income} icon="💰" />
        <TrendCard title="Poupança" trend={trendData.savings} icon="🏦" />
      </div>

      {/* Resumo dos últimos 6 meses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Histórico Mensal</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {trendData.monthlyData.map((monthData, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 capitalize">
                {monthData.monthName}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Gastos</div>
                <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(monthData.totalExpenses)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Receitas</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(monthData.totalIncome)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tendências por categoria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Tendências por Categoria
        </h3>
        <div className="space-y-3">
          {Object.entries(trendData.byCategory)
            .filter(([, trend]) => trend.percentage > 0.1) // Mostrar apenas categorias com mudança significativa
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .map(([category, trend]) => (
              <CategoryTrendRow key={category} category={category} trend={trend} />
            ))}
        </div>
        {Object.values(trendData.byCategory).every(t => t.percentage <= 0.1) && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhuma variação significativa nas categorias
          </p>
        )}
      </div>
    </div>
  );
};

TrendAnalysis.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default TrendAnalysis;
