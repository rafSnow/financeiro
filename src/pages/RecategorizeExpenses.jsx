import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BatchCategorizationList from '../components/BatchCategorizationList';
import Header from '../components/Header';
import { getAllExpenses } from '../services/expenses.service';
import { useAuthStore } from '../store/authStore';

/**
 * Página de Recategorização de Despesas
 * Permite categorizar em lote despesas com categoria "Outros"
 */
const RecategorizeExpenses = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [uncategorized, setUncategorized] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar despesas não categorizadas
  useEffect(() => {
    const loadUncategorized = async () => {
      if (!user?.uid) {
        navigate('/login');
        return;
      }

      setLoading(true);

      try {
        const allExpenses = await getAllExpenses(user.uid);

        // Filtrar apenas despesas com categoria "Outros"
        const filtered = allExpenses.filter(
          expense => expense.category === 'Outros' || !expense.category
        );

        setUncategorized(filtered);
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUncategorized();
  }, [user?.uid, navigate, refreshKey]);

  // Atualizar lista após categorização
  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/expenses')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recategorizar Despesas</h1>
              <p className="text-gray-600 mt-1">
                Categorize automaticamente despesas não classificadas
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          {!loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Despesas não categorizadas</p>
                  <p className="text-2xl font-bold text-blue-900">{uncategorized.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Lista de despesas */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sugestões de Categorização</h2>
            <p className="text-sm text-gray-600 mb-6">
              Nossa IA analisou suas despesas e sugeriu categorias baseadas em padrões e histórico.
              Aceite as sugestões ou escolha manualmente.
            </p>

            <BatchCategorizationList
              uncategorized={uncategorized}
              onUpdate={handleUpdate}
              userId={user?.uid}
            />
          </div>
        )}

        {/* Ajuda */}
        {!loading && uncategorized.length > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Dicas</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Aceite sugestões com alta confiança (verde) para economizar tempo</li>
              <li>• Revise sugestões com baixa confiança (laranja) antes de aceitar</li>
              <li>• Escolha manualmente se a sugestão não fizer sentido</li>
              <li>• O sistema aprende com suas escolhas e melhora com o tempo</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecategorizeExpenses;
