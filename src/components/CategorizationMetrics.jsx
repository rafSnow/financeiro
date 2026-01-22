/**
 * Componente de Métricas de Performance do Sistema de Categorização
 * Exibe estatísticas sobre acurácia, confiança e métodos utilizados
 */

import { useEffect, useState } from 'react';
import { getCategorizationHistory } from '../services/categorizationHistory.service';
import { useAuthStore } from '../store/authStore';

/**
 * Card de métrica individual
 */
const MetricCard = ({ title, value, description, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
    </div>
  );
};

/**
 * Gráfico de Pizza Simples (apenas visual com CSS)
 */
const PieChart = ({ data, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados disponíveis</p>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const colors = {
    keyword: '#3B82F6', // blue
    history: '#10B981', // green
    scoring: '#F59E0B', // orange
    fallback: '#64748B', // gray
    default: '#EC4899', // pink
    unknown: '#6366F1', // indigo
  };

  const methodLabels = {
    keyword: 'Keywords',
    history: 'Histórico',
    scoring: 'Scoring',
    fallback: 'Padrão',
    default: 'Padrão',
    unknown: 'Desconhecido',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h4>

      <div className="space-y-3">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .map(([method, count]) => {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const color = colors[method] || colors.unknown;

            return (
              <div key={method} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {methodLabels[method] || method}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total de categorizações: <span className="font-semibold">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente principal de métricas de categorização
 */
const CategorizationMetrics = () => {
  const user = useAuthStore(state => state.user);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMetrics = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const history = await getCategorizationHistory(user.uid, 500);

        if (history.length === 0) {
          setMetrics({
            total: 0,
            corrected: 0,
            accuracy: 0,
            byMethod: {},
            avgConfidence: 0,
          });
          setLoading(false);
          return;
        }

        const total = history.length;
        const corrected = history.filter(h => h.wasCorrected).length;
        const accuracy = total > 0 ? ((total - corrected) / total) * 100 : 0;

        // Contar por método
        const byMethod = {};
        history.forEach(h => {
          const method = h.method || 'unknown';
          byMethod[method] = (byMethod[method] || 0) + 1;
        });

        // Calcular confiança média
        const totalConfidence = history.reduce((sum, h) => sum + (h.confidence || 0), 0);
        const avgConfidence = total > 0 ? totalConfidence / total : 0;

        setMetrics({
          total,
          corrected,
          accuracy,
          byMethod,
          avgConfidence,
        });
      } catch (error) {
        console.error('Erro ao calcular métricas:', error);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    calculateMetrics();
  }, [user?.uid]);

  if (!user?.uid) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          Faça login para ver as métricas
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Calculando métricas...</p>
      </div>
    );
  }

  if (!metrics || metrics.total === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nenhuma Categorização Registrada
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Comece a adicionar despesas e utilize o sistema de categorização automática. As métricas
          aparecerão aqui conforme você usar o sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-2">📊 Performance do Sistema de Categorização</h3>
        <p className="text-blue-100 dark:text-blue-200 text-sm">
          Estatísticas de precisão e desempenho da IA de categorização
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Precisão"
          value={`${metrics.accuracy.toFixed(1)}%`}
          description="Categorizações aceitas sem correção"
          color={metrics.accuracy >= 80 ? 'green' : metrics.accuracy >= 60 ? 'orange' : 'blue'}
        />

        <MetricCard
          title="Total Categorizado"
          value={metrics.total}
          description="Despesas processadas"
          color="blue"
        />

        <MetricCard
          title="Corrigidas"
          value={metrics.corrected}
          description="Sugestões corrigidas manualmente"
          color="orange"
        />

        <MetricCard
          title="Confiança Média"
          value={`${(metrics.avgConfidence * 100).toFixed(0)}%`}
          description="Nível médio de certeza do sistema"
          color="purple"
        />
      </div>

      {/* Gráfico de Métodos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart data={metrics.byMethod} title="Distribuição por Método" />

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            💡 Insights
          </h4>

          <div className="space-y-3">
            {metrics.accuracy >= 80 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">✅</span>
                <div>
                  <span className="font-medium text-green-700">Excelente precisão!</span>
                  <p className="text-gray-600 text-xs mt-1">
                    O sistema está categorizando corretamente mais de 80% das vezes.
                  </p>
                </div>
              </div>
            )}

            {metrics.accuracy < 80 && metrics.accuracy >= 60 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">⚠️</span>
                <div>
                  <span className="font-medium text-orange-700">Precisão moderada</span>
                  <p className="text-gray-600 text-xs mt-1">
                    Continue usando o sistema para melhorar o aprendizado.
                  </p>
                </div>
              </div>
            )}

            {metrics.accuracy < 60 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">📈</span>
                <div>
                  <span className="font-medium text-blue-700">Sistema aprendendo</span>
                  <p className="text-gray-600 text-xs mt-1">
                    Quanto mais você usar, melhor a precisão ficará.
                  </p>
                </div>
              </div>
            )}

            {metrics.byMethod.history > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">🧠</span>
                <div>
                  <span className="font-medium text-purple-700">IA Personalizada Ativa</span>
                  <p className="text-gray-600 text-xs mt-1">
                    O sistema está aprendendo com seus padrões de categorização.
                  </p>
                </div>
              </div>
            )}

            {metrics.avgConfidence >= 0.8 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">🎯</span>
                <div>
                  <span className="font-medium text-blue-700">Alta confiança</span>
                  <p className="text-gray-600 text-xs mt-1">
                    O sistema está muito confiante nas sugestões.
                  </p>
                </div>
              </div>
            )}

            {metrics.total < 50 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-lg">🚀</span>
                <div>
                  <span className="font-medium text-gray-700">Continue usando</span>
                  <p className="text-gray-600 text-xs mt-1">
                    Mais dados = melhor precisão. Adicione mais despesas!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Como melhorar a precisão
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Corrija sugestões incorretas - o sistema aprende com suas escolhas</li>
              <li>• Use descrições consistentes para transações similares</li>
              <li>• Quanto mais você usar, melhor a IA ficará</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorizationMetrics;
