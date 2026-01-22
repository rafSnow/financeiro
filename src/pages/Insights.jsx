import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import InsightCard from '../components/InsightCard';
import TrendAnalysis from '../components/TrendAnalysis';
import { useAuthStore } from '../store/authStore';
import { generateCurrentMonthInsights, sortInsightsByPriority } from '../utils/insightsGenerator';

/**
 * Página de Insights
 * Exibe análise inteligente das finanças do usuário
 */
const Insights = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Carregar insights
  useEffect(() => {
    const loadInsights = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const generated = await generateCurrentMonthInsights(user.uid);
        const sorted = sortInsightsByPriority(generated);
        setInsights(sorted);
      } catch (error) {
        console.error('Erro ao carregar insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [user]);

  // Filtrar insights por severidade
  const filteredInsights =
    filterSeverity === 'all'
      ? insights
      : insights.filter(insight => insight.severity === filterSeverity);

  // Contadores por severidade
  const severityCounts = {
    error: insights.filter(i => i.severity === 'error').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    info: insights.filter(i => i.severity === 'info').length,
    success: insights.filter(i => i.severity === 'success').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 pb-24 pt-20">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">💡 Seus Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise inteligente das suas finanças este mês</p>
        </div>

        {loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Analisando suas finanças...</p>
          </div>
        ) : insights.length === 0 ? (
          // Estado vazio
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum insight disponível</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Registre suas despesas e receitas para gerar insights automáticos
            </p>
            <button
              onClick={() => navigate('/expenses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Adicionar Despesa
            </button>
          </div>
        ) : (
          <>
            {/* Filtros de severidade */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterSeverity === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Todos ({insights.length})
              </button>
              {severityCounts.error > 0 && (
                <button
                  onClick={() => setFilterSeverity('error')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterSeverity === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  Críticos ({severityCounts.error})
                </button>
              )}
              {severityCounts.warning > 0 && (
                <button
                  onClick={() => setFilterSeverity('warning')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterSeverity === 'warning'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-yellow-300 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  }`}
                >
                  Atenção ({severityCounts.warning})
                </button>
              )}
              {severityCounts.info > 0 && (
                <button
                  onClick={() => setFilterSeverity('info')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterSeverity === 'info'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  Dicas ({severityCounts.info})
                </button>
              )}
              {severityCounts.success > 0 && (
                <button
                  onClick={() => setFilterSeverity('success')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterSeverity === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  Conquistas ({severityCounts.success})
                </button>
              )}
            </div>

            {/* Grid de insights */}
            {filteredInsights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Nenhum insight nesta categoria</p>
              </div>
            )}

            {/* Análise de Tendências */}
            <div className="mt-12">
              <TrendAnalysis userId={user.uid} />
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Insights;
