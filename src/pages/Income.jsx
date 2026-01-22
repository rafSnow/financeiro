import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import IncomeCard from '../components/IncomeCard';
import IncomeForm from '../components/IncomeForm';
import Modal from '../components/Modal';
import { createIncome, deleteIncome, getIncomes, updateIncome } from '../services/income.service';
import { useAuthStore } from '../store/authStore';
import { useIncomeStore } from '../store/incomeStore';
import { formatCurrency, getMonthName } from '../utils/constants';

/**
 * Página de Rendas
 * Lista e gerencia rendas do usuário
 */
const Income = () => {
  const { user } = useAuthStore();
  const {
    incomes,
    loading,
    currentMonth,
    currentYear,
    setIncomes,
    setLoading,
    setCurrentMonth,
    setCurrentYear,
    getTotal,
    getTotalByType,
    getTotalReceived,
    getTotalPending,
  } = useIncomeStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Carregar rendas ao montar o componente
  useEffect(() => {
    const loadIncomes = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const data = await getIncomes(user.uid, currentMonth, currentYear);
        setIncomes(data);
      } catch (error) {
        console.error('Erro ao carregar rendas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIncomes();
  }, [currentMonth, currentYear, user, setIncomes, setLoading]);

  const handleEdit = income => {
    setSelectedIncome(income);
    setIsFormOpen(true);
  };

  const handleDelete = income => {
    setSelectedIncome(income);
    setIsDeleteModalOpen(true);
  };

  const handleNewIncome = () => {
    setSelectedIncome(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedIncome(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedIncome(null);
  };

  const handleSubmitForm = async data => {
    if (!user?.uid) return;

    setFormLoading(true);
    try {
      if (selectedIncome) {
        // Editar renda existente
        await updateIncome(selectedIncome.id, data);
      } else {
        // Criar nova renda
        await createIncome(user.uid, data);
      }

      // Recarregar lista
      const updatedIncomes = await getIncomes(user.uid, currentMonth, currentYear);
      setIncomes(updatedIncomes);

      // Fechar modal
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar renda:', error);
      alert('Erro ao salvar renda. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedIncome || !user?.uid) return;

    setFormLoading(true);
    try {
      await deleteIncome(selectedIncome.id);

      // Recarregar lista
      const updatedIncomes = await getIncomes(user.uid, currentMonth, currentYear);
      setIncomes(updatedIncomes);

      // Fechar modal
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir renda:', error);
      alert('Erro ao excluir renda. Tente novamente.');
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

  // Filtrar rendas por tipo
  const filteredIncomes =
    filterType === 'all' ? incomes : incomes.filter(inc => inc.type === filterType);

  const total = getTotal();
  const totalByType = getTotalByType();
  const totalReceived = getTotalReceived();
  const totalPending = getTotalPending();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rendas</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie suas fontes de renda</p>
            </div>

            <button
              onClick={handleNewIncome}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Nova Renda</span>
            </button>
          </div>
        </div>

        {/* Seletor de mês */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
          style={{ marginBottom: '2rem' }}
        >
          <div className="flex items-center justify-between" style={{ padding: '1.5rem' }}>
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: {formatCurrency(total)}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
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

        {/* Cards de resumo */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ marginBottom: '2rem' }}
        >
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💵</span>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Salários */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💼</span>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Salários</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalByType.salary)}</p>
          </div>

          {/* Extras */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Extras</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalByType.extra)}</p>
          </div>

          {/* Recebido vs Pendente */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-green-600 font-medium">
                ✅ {formatCurrency(totalReceived)}
              </p>
              <p className="text-sm text-yellow-600 font-medium">
                ⏳ {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterType === 'all'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('salary')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterType === 'salary'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              💼 Salários
            </button>
            <button
              onClick={() => setFilterType('extra')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterType === 'extra'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              💰 Extras
            </button>
          </div>
        </div>

        {/* Lista de rendas */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
              style={{ padding: '3rem' }}
            >
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto"
                style={{ marginBottom: '1rem' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white"
                style={{ marginBottom: '0.5rem' }}
              >
                Nenhuma renda
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adicione sua primeira renda para começar
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredIncomes.map(income => (
                <IncomeCard
                  key={income.id}
                  income={income}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal de formulário */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedIncome ? 'Editar Renda' : 'Nova Renda'}
        size="lg"
      >
        <IncomeForm
          income={selectedIncome}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Excluir Renda"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Tem certeza que deseja excluir esta renda?
            {selectedIncome && (
              <span className="block mt-2 font-semibold text-gray-900 dark:text-white">
                {selectedIncome.description} - {formatCurrency(selectedIncome.amount)}
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCloseDeleteModal}
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
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

export default Income;
