import { useEffect, useState } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import BottomNav from '../components/BottomNav';
import Confetti from '../components/Confetti';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';
import Header from '../components/Header';
import {
  completeGoal,
  createGoal,
  deleteGoal,
  getGoals,
  pauseGoal,
  resumeGoal,
  updateGoal,
  updateGoalProgress,
} from '../services/goals.service';
import { useAuthStore } from '../store/authStore';
import { useGoalsStore } from '../store/goalsStore';
import { useToastStore } from '../store/toastStore';

/**
 * Página de Metas
 */
export default function Goals() {
  const { user: currentUser } = useAuthStore();
  const { goals, setGoals, setLoading } = useGoalsStore();
  const { addToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('active'); // active, completed, paused, all
  const [showConfetti, setShowConfetti] = useState(false);

  // Carrega metas do Firestore
  const loadGoals = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await getGoals(currentUser.uid);
      setGoals(data);
    } catch {
      addToast('Erro ao carregar metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Carrega metas ao montar
  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Filtra metas
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  // Abre formulário para criar
  const handleCreate = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  // Abre formulário para editar
  const handleEdit = goal => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  // Fecha formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  // Submete formulário (criar ou editar)
  const handleSubmitForm = async data => {
    try {
      setLoading(true);

      if (editingGoal) {
        // Editar
        await updateGoal(editingGoal.id, data);
        addToast('Meta atualizada com sucesso', 'success');
      } else {
        // Criar
        await createGoal(currentUser.uid, data);
        addToast('Meta criada com sucesso', 'success');
      }

      await loadGoals();
      handleCloseForm();
    } catch {
      addToast(editingGoal ? 'Erro ao atualizar meta' : 'Erro ao criar meta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Adiciona progresso
  const handleUpdateProgress = async goal => {
    const amount = prompt(`Quanto você quer adicionar à meta "${goal.name}"?`);
    if (!amount) return;

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      addToast('Valor inválido', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateGoalProgress(goal.id, value);

      // Verifica se completou
      const newAmount = goal.currentAmount + value;
      if (newAmount >= goal.targetAmount) {
        addToast('🎉 Parabéns! Meta concluída!', 'success');
        setShowConfetti(true);
      } else {
        addToast('Progresso adicionado com sucesso', 'success');
      }

      await loadGoals();
    } catch {
      addToast('Erro ao adicionar progresso', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pausa meta
  const handlePause = async goalId => {
    try {
      setLoading(true);
      await pauseGoal(goalId);
      addToast('Meta pausada', 'info');
      await loadGoals();
    } catch {
      addToast('Erro ao pausar meta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Retoma meta
  const handleResume = async goalId => {
    try {
      setLoading(true);
      await resumeGoal(goalId);
      addToast('Meta retomada', 'success');
      await loadGoals();
    } catch {
      addToast('Erro ao retomar meta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Completa meta manualmente
  const handleComplete = async goalId => {
    try {
      setLoading(true);
      await completeGoal(goalId);
      addToast('🎉 Meta concluída!', 'success');
      setShowConfetti(true);
      await loadGoals();
    } catch {
      addToast('Erro ao concluir meta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Deleta meta
  const handleDelete = async goalId => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      setLoading(true);
      await deleteGoal(goalId);
      addToast('Meta excluída', 'success');
      await loadGoals();
    } catch {
      addToast('Erro ao excluir meta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    paused: goals.filter(g => g.status === 'paused').length,
    totalTarget: goals
      .filter(g => g.status === 'active')
      .reduce((sum, g) => sum + g.targetAmount, 0),
    totalCurrent: goals
      .filter(g => g.status === 'active')
      .reduce((sum, g) => sum + g.currentAmount, 0),
  };

  const overallProgress =
    stats.totalTarget > 0 ? (stats.totalCurrent / stats.totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metas</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie seus objetivos financeiros
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Nova Meta</span>
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Metas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ativas</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">Progresso Geral</p>
            <p className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por:
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                filter === 'active'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Ativas ({stats.active})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Concluídas ({stats.completed})
            </button>
            <button
              onClick={() => setFilter('paused')}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                filter === 'paused'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Pausadas ({stats.paused})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Todas ({stats.total})
            </button>
          </div>
        </div>

        {/* Lista de Metas */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
            <p className="text-6xl mb-4">🎯</p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {filter === 'all'
                ? 'Você ainda não tem metas cadastradas'
                : `Nenhuma meta ${
                    filter === 'active' ? 'ativa' : filter === 'completed' ? 'concluída' : 'pausada'
                  }`}
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Criar Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
                onPause={handlePause}
                onResume={handleResume}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Formulário Modal */}
      {showForm && (
        <GoalForm goal={editingGoal} onSubmit={handleSubmitForm} onClose={handleCloseForm} />
      )}

      {/* Confetti */}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}
