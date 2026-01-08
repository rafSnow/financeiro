import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import DebtCard from '../components/DebtCard';
import DebtForm from '../components/DebtForm';
import DebtMethodSelector from '../components/DebtMethodSelector';
import Header from '../components/Header';
import Modal from '../components/Modal';
import {
  createDebt,
  deleteDebt,
  getDebts,
  registerPayment,
  updateDebt,
  updateDebtPriorities,
} from '../services/debts.service';
import { useAuthStore } from '../store/authStore';
import { useDebtsStore } from '../store/debtsStore';
import { formatCurrency } from '../utils/constants';
import {
  getPriorityColor,
  getPriorityIcon,
  sortDebtsByAvalanche,
  sortDebtsBySnowball,
} from '../utils/debtCalculations';

/**
 * Página de Dívidas
 * Lista e gerencia dívidas do usuário
 */
const Debts = () => {
  const { user } = useAuthStore();
  const {
    debts,
    loading,
    setDebts,
    setLoading,
    getTotalDebt,
    getTotalMonthlyPayment,
    getTotalInterest,
    getActiveDebts,
  } = useDebtsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [debtMethod, setDebtMethod] = useState('snowball');
  const [sortedDebts, setSortedDebts] = useState([]);

  // Carregar dívidas ao montar o componente
  useEffect(() => {
    const loadDebts = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const data = await getDebts(user.uid);
        setDebts(data);
      } catch (error) {
        console.error('Erro ao carregar dívidas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDebts();
  }, [user, setDebts, setLoading]);

  // Ordenar dívidas quando mudar o método ou as dívidas
  useEffect(() => {
    if (debts.length === 0) {
      setSortedDebts([]);
      return;
    }

    const sorted =
      debtMethod === 'snowball' ? sortDebtsBySnowball(debts) : sortDebtsByAvalanche(debts);

    setSortedDebts(sorted);
  }, [debts, debtMethod]);

  // Atualizar prioridades no Firebase quando mudar o método
  const handleMethodChange = async newMethod => {
    setDebtMethod(newMethod);

    if (user?.uid && debts.length > 0) {
      try {
        await updateDebtPriorities(user.uid, newMethod);
        // Recarregar dívidas para pegar as novas prioridades
        const updatedDebts = await getDebts(user.uid);
        setDebts(updatedDebts);
      } catch (error) {
        console.error('Erro ao atualizar prioridades:', error);
      }
    }
  };

  const handleEdit = debt => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handleDelete = debt => {
    setSelectedDebt(debt);
    setIsDeleteModalOpen(true);
  };

  const handlePay = debt => {
    setSelectedDebt(debt);
    setIsPaymentModalOpen(true);
  };

  const handleNewDebt = () => {
    setSelectedDebt(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDebt(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDebt(null);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedDebt(null);
  };

  const handleSubmitForm = async data => {
    if (!user?.uid) return;

    setFormLoading(true);
    try {
      if (selectedDebt) {
        // Editar dívida existente
        await updateDebt(selectedDebt.id, data);
      } else {
        // Criar nova dívida
        await createDebt(user.uid, data);
      }

      // Recarregar lista
      const updatedDebts = await getDebts(user.uid);
      setDebts(updatedDebts);

      // Fechar modal
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
      alert('Erro ao salvar dívida. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDebt || !user?.uid) return;

    setFormLoading(true);
    try {
      await deleteDebt(selectedDebt.id);

      // Recarregar lista
      const updatedDebts = await getDebts(user.uid);
      setDebts(updatedDebts);

      // Fechar modal
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      alert('Erro ao excluir dívida. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDebt || !user?.uid) return;

    setFormLoading(true);
    try {
      await registerPayment(selectedDebt.id, selectedDebt.installmentValue);

      // Recarregar lista
      const updatedDebts = await getDebts(user.uid);
      setDebts(updatedDebts);

      // Fechar modal
      handleClosePaymentModal();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  // Filtrar dívidas por status
  const filteredDebts =
    filterStatus === 'all' ? debts : debts.filter(d => d.status === filterStatus);

  const totalDebt = getTotalDebt();
  const totalMonthlyPayment = getTotalMonthlyPayment();
  const totalInterest = getTotalInterest();
  const activeDebts = getActiveDebts();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dívidas</h1>
              <p className="text-gray-600 mt-1">Gerencie suas dívidas com método snowball</p>
            </div>

            <button
              onClick={handleNewDebt}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Nova Dívida</span>
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ marginBottom: '2rem' }}
        >
          {/* Total Devendo */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <h3 className="text-sm font-medium text-gray-600">Total Devendo</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
          </div>

          {/* Pagamento Mensal */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <h3 className="text-sm font-medium text-gray-600">Pagamento/Mês</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalMonthlyPayment)}
            </p>
          </div>

          {/* Juros/Mês */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📈</span>
              <h3 className="text-sm font-medium text-gray-600">Juros/Mês</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalInterest)}</p>
          </div>

          {/* Dívidas Ativas */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className="text-sm font-medium text-gray-600">Dívidas Ativas</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeDebts.length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterStatus === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterStatus === 'active'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              🔴 Ativas
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm ${
                filterStatus === 'paid'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              ✅ Quitadas
            </button>
          </div>
        </div>

        {/* Seletor de Método (apenas para dívidas ativas) */}
        {filterStatus === 'active' && activeDebts.length > 0 && (
          <DebtMethodSelector selectedMethod={debtMethod} onMethodChange={handleMethodChange} />
        )}

        {/* Lista de dívidas */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : filteredDebts.length === 0 ? (
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center"
              style={{ padding: '3rem' }}
            >
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3
                className="text-lg font-semibold text-gray-900"
                style={{ marginBottom: '0.5rem' }}
              >
                Nenhuma dívida
              </h3>
              <p className="text-gray-600">
                {filterStatus === 'all'
                  ? 'Parabéns! Você não tem dívidas cadastradas'
                  : filterStatus === 'active'
                  ? 'Você não tem dívidas ativas'
                  : 'Você ainda não quitou nenhuma dívida'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {(filterStatus === 'active' ? sortedDebts : filteredDebts).map((debt, index) => {
                const isActive = debt.status === 'active';
                const showPriority = filterStatus === 'active' && isActive;

                return (
                  <div key={debt.id} className="relative">
                    {showPriority && debt.priority && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <div
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 shadow-md ${getPriorityColor(
                            debt.priority
                          )}`}
                        >
                          <span>{getPriorityIcon(debt.priority)}</span>
                          {debt.priority === 1 && <span>PRIORIDADE</span>}
                        </div>
                      </div>
                    )}
                    <DebtCard
                      debt={debt}
                      onPay={handlePay}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal de formulário */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedDebt ? 'Editar Dívida' : 'Nova Dívida'}
        size="lg"
      >
        <DebtForm
          debt={selectedDebt}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Excluir Dívida"
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
            Tem certeza que deseja excluir esta dívida?
            {selectedDebt && (
              <span className="block mt-2 font-semibold text-gray-900">
                {selectedDebt.name} - {formatCurrency(selectedDebt.remainingAmount)}
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

      {/* Modal de pagamento */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title="Registrar Pagamento"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
          {selectedDebt && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedDebt.name}</h3>
              <p className="text-gray-700 mb-4">
                Confirmar pagamento de{' '}
                <span className="font-bold">{formatCurrency(selectedDebt.installmentValue)}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    Restante atual:{' '}
                    <span className="font-semibold">
                      {formatCurrency(selectedDebt.remainingAmount)}
                    </span>
                  </p>
                  <p>
                    Após pagamento:{' '}
                    <span className="font-semibold">
                      {formatCurrency(selectedDebt.remainingAmount - selectedDebt.installmentValue)}
                    </span>
                  </p>
                  <p>
                    Parcela: {selectedDebt.paidInstallments + 1} de {selectedDebt.totalInstallments}
                  </p>
                </div>
              </div>
            </>
          )}
          <div className="flex gap-3">
            <Button onClick={handleClosePaymentModal} variant="secondary" disabled={formLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment} variant="primary" loading={formLoading}>
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Debts;
