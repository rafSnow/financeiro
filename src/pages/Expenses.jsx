import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import ExpenseCard from '../components/ExpenseCard';
import Header from '../components/Header';
import { getExpenses } from '../services/expenses.service';
import { useAuthStore } from '../store/authStore';
import { useExpensesStore } from '../store/expensesStore';
import {
  DEFAULT_CATEGORIES,
  formatCurrency,
  getCategoryById,
  getMonthName,
} from '../utils/constants';

/**
 * Página de Despesas
 * Lista e gerencia despesas do usuário
 */
const Expenses = () => {
  const { user } = useAuthStore();
  const {
    expenses,
    loading,
    currentMonth,
    currentYear,
    setExpenses,
    setLoading,
    setCurrentMonth,
    setCurrentYear,
    getTotalByCategory,
    getTotal,
  } = useExpensesStore();

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Carregar despesas ao montar o componente
  useEffect(() => {
    const loadExpenses = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const data = await getExpenses(user.uid, currentMonth, currentYear);
        setExpenses(data);
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [currentMonth, currentYear, user, setExpenses, setLoading]);

  const handleEdit = expense => {
    // TODO: Implementar modal de edição no Dia 2
    console.log('Editar despesa:', expense);
  };

  const handleDelete = expense => {
    // TODO: Implementar modal de confirmação no Dia 2
    console.log('Excluir despesa:', expense);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filtrar despesas por categoria
  const filteredExpenses =
    selectedCategory === 'all'
      ? expenses
      : expenses.filter(exp => exp.category === selectedCategory);

  // Calcular total por categoria
  const totalByCategory = getTotalByCategory();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
              <p className="text-gray-600 mt-1">Gerencie seus gastos mensais</p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Nova Despesa</span>
            </button>
          </div>
        </div>

        {/* Seletor de mês */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between" style={{ padding: '1.5rem' }}>
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Total: {formatCurrency(total)}</p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Total por categoria */}
        {Object.keys(totalByCategory).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
            {Object.entries(totalByCategory).map(([categoryId, amount]) => {
              const category = getCategoryById(categoryId);
              return (
                <div
                  key={categoryId}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  style={{ padding: '1.5rem' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <span className="text-xl">{category.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-medium text-gray-600 mb-1">{category.name}</h3>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filtros */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            {DEFAULT_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de despesas */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center" style={{ padding: '3rem' }}>
              <svg
                className="w-16 h-16 text-gray-400 mx-auto"
                style={{ marginBottom: '1rem' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: '0.5rem' }}>
                Nenhuma despesa
              </h3>
              <p className="text-gray-600">
                {selectedCategory === 'all'
                  ? 'Adicione sua primeira despesa para começar'
                  : `Nenhuma despesa na categoria ${getCategoryById(selectedCategory).name}`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Expenses;
