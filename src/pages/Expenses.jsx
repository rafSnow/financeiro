import { useEffect, useState } from 'react';
import { AnimatedCard, AnimatedList } from '../components/Animations';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { ExpenseCardSkeleton } from '../components/Skeleton';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '../services/expenses.service';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = expense => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const handleNewExpense = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedExpense(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedExpense(null);
  };

  const handleSubmitForm = async data => {
    if (!user?.uid) return;

    setFormLoading(true);
    try {
      if (selectedExpense) {
        // Editar despesa existente
        await updateExpense(selectedExpense.id, data);
      } else {
        // Criar nova despesa
        await createExpense(user.uid, data);
      }

      // Recarregar lista
      const updatedExpenses = await getExpenses(user.uid, currentMonth, currentYear);
      setExpenses(updatedExpenses);

      // Fechar modal
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpense || !user?.uid) return;

    setFormLoading(true);
    try {
      await deleteExpense(selectedExpense.id);

      // Recarregar lista
      const updatedExpenses = await getExpenses(user.uid, currentMonth, currentYear);
      setExpenses(updatedExpenses);

      // Fechar modal
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
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

            <button
              onClick={handleNewExpense}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
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
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
          style={{ marginBottom: '2rem' }}
        >
          <div className="flex items-center justify-between" style={{ padding: '1.5rem' }}>
            <button
              onClick={handlePreviousMonth}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Total por categoria */}
        {Object.keys(totalByCategory).length > 0 && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4"
            style={{ marginBottom: '2rem' }}
          >
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
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'thin' }}
          >
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
            <div className="flex flex-col gap-4">
              <ExpenseCardSkeleton />
              <ExpenseCardSkeleton />
              <ExpenseCardSkeleton />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              icon={selectedCategory === 'all' ? '💸' : '🔍'}
              title={
                selectedCategory === 'all'
                  ? 'Nenhuma despesa registrada'
                  : 'Nenhuma despesa encontrada'
              }
              description={
                selectedCategory === 'all'
                  ? 'Comece adicionando sua primeira despesa para acompanhar seus gastos mensais'
                  : `Nenhuma despesa na categoria ${getCategoryById(selectedCategory).name}`
              }
              action={
                selectedCategory === 'all'
                  ? {
                      label: 'Adicionar Despesa',
                      onClick: handleNewExpense,
                      variant: 'primary',
                    }
                  : null
              }
            />
          ) : (
            <AnimatedList>
              {filteredExpenses.map(expense => (
                <AnimatedCard key={expense.id}>
                  <ExpenseCard expense={expense} onEdit={handleEdit} onDelete={handleDelete} />
                </AnimatedCard>
              ))}
            </AnimatedList>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal de formulário */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedExpense ? 'Editar Despesa' : 'Nova Despesa'}
        size="lg"
      >
        <ExpenseForm
          expense={selectedExpense}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Excluir Despesa"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-6">
            Tem certeza que deseja excluir esta despesa?
            {selectedExpense && (
              <span className="block mt-2 font-semibold text-gray-900">
                {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCloseDeleteModal}
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
