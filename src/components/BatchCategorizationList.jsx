import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { autoCategorize } from '../services/autoCategorization.service';
import { DEFAULT_CATEGORIES } from '../services/categories.service';
import { saveCategorizationHistory } from '../services/categorizationHistory.service';
import { updateExpense } from '../services/expenses.service';
import Button from './Button';
import Modal from './Modal';

/**
 * Lista de categorização em lote
 * Permite categorizar múltiplas despesas de uma vez
 */
const BatchCategorizationList = ({ uncategorized, onUpdate, userId }) => {
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Gerar sugestões para todas as despesas
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!uncategorized || uncategorized.length === 0 || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const newSuggestions = {};

        for (const expense of uncategorized) {
          const suggestion = await autoCategorize(expense.description, userId);
          newSuggestions[expense.id] = suggestion;
        }

        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Erro ao gerar sugestões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [uncategorized, userId]);

  // Aceitar sugestão
  const handleAcceptSuggestion = async expenseId => {
    const suggestion = suggestions[expenseId];
    const expense = uncategorized.find(e => e.id === expenseId);

    if (!suggestion || !expense) return;

    setProcessing(prev => ({ ...prev, [expenseId]: true }));

    try {
      // Atualizar despesa
      await updateExpense(expenseId, {
        category: suggestion.category,
      });

      // Salvar histórico
      await saveCategorizationHistory(userId, {
        description: expense.description,
        suggestedCategory: suggestion.category,
        finalCategory: suggestion.category,
        wasCorrected: false,
        confidence: suggestion.confidence,
        method: suggestion.method,
      });

      // Notificar atualização
      onUpdate();
    } catch (error) {
      console.error('Erro ao aceitar sugestão:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  // Abrir modal para escolher categoria
  const handleChooseCategory = expense => {
    setSelectedExpense(expense);
    setSelectedCategory('');
    setShowCategoryModal(true);
  };

  // Aplicar categoria escolhida
  const handleApplyCategory = async () => {
    if (!selectedExpense || !selectedCategory) return;

    const suggestion = suggestions[selectedExpense.id];

    setProcessing(prev => ({ ...prev, [selectedExpense.id]: true }));
    setShowCategoryModal(false);

    try {
      // Atualizar despesa
      await updateExpense(selectedExpense.id, {
        category: selectedCategory,
      });

      // Salvar histórico
      await saveCategorizationHistory(userId, {
        description: selectedExpense.description,
        suggestedCategory: suggestion?.category || 'Outros',
        finalCategory: selectedCategory,
        wasCorrected: true,
        confidence: suggestion?.confidence || 0,
        method: suggestion?.method || 'manual',
      });

      // Notificar atualização
      onUpdate();
    } catch (error) {
      console.error('Erro ao aplicar categoria:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [selectedExpense.id]: false }));
      setSelectedExpense(null);
      setSelectedCategory('');
    }
  };

  // Obter dados da categoria
  const getCategoryData = categoryName => {
    return (
      DEFAULT_CATEGORIES.find(cat => cat.name === categoryName) || {
        name: categoryName,
        icon: '📦',
        color: '#64748B',
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!uncategorized || uncategorized.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Todas as despesas estão categorizadas!
        </h3>
        <p className="text-gray-500">
          Não há despesas com categoria &quot;Outros&quot; para recategorizar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {uncategorized.map(expense => {
          const suggestion = suggestions[expense.id];
          const isProcessing = processing[expense.id];
          const categoryData = getCategoryData(suggestion?.category || 'Outros');
          const confidence = suggestion?.confidence || 0;
          const percentage = Math.round(confidence * 100);

          return (
            <div
              key={expense.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Informações da despesa */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate mb-1">{expense.description}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">
                      R$ {expense.amount?.toFixed(2).replace('.', ',')}
                    </span>
                    <span>
                      {expense.date?.toDate
                        ? new Date(expense.date.toDate()).toLocaleDateString('pt-BR')
                        : 'Data não disponível'}
                    </span>
                  </div>
                </div>

                {/* Sugestão */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{categoryData.icon}</span>
                      <span className="font-medium text-gray-700">{categoryData.name}</span>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        percentage >= 90
                          ? 'bg-green-100 text-green-700'
                          : percentage >= 70
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {percentage}% confiança
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleAcceptSuggestion(expense.id)}
                      variant="primary"
                      size="sm"
                      loading={isProcessing}
                      disabled={isProcessing}
                    >
                      ✓ Aceitar
                    </Button>
                    <Button
                      onClick={() => handleChooseCategory(expense)}
                      variant="secondary"
                      size="sm"
                      disabled={isProcessing}
                    >
                      ✎ Escolher
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de escolha de categoria */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Escolher Categoria"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Escolha a categoria correta para: <strong>{selectedExpense?.description}</strong>
          </p>

          <div className="space-y-2">
            {DEFAULT_CATEGORIES.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  selectedCategory === category.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <category.icon className="text-2xl" style={{ color: category.color }} />
                <span className="font-medium text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleApplyCategory} disabled={!selectedCategory}>
              Aplicar Categoria
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BatchCategorizationList.propTypes = {
  uncategorized: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default BatchCategorizationList;
