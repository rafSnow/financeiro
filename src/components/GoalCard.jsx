import PropTypes from 'prop-types';
import { FiCheck, FiEdit2, FiPause, FiPlay, FiTrash2 } from 'react-icons/fi';
import { useGoalsStore } from '../store/goalsStore';
import ProgressBar from './ProgressBar';

/**
 * Card para exibir uma meta
 */
export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  onPause,
  onResume,
  onComplete,
}) {
  const { getGoalPercentage, getDaysRemaining } = useGoalsStore();

  const percentage = getGoalPercentage(goal.id);
  const daysRemaining = getDaysRemaining(goal.id);

  // Cores por categoria
  const categoryColors = {
    debt: 'red',
    savings: 'green',
    investment: 'blue',
    purchase: 'purple',
  };

  // Ícones por categoria
  const categoryIcons = {
    debt: '💳',
    savings: '💰',
    investment: '📈',
    purchase: '🛒',
  };

  // Labels por categoria
  const categoryLabels = {
    debt: 'Dívida',
    savings: 'Poupança',
    investment: 'Investimento',
    purchase: 'Compra',
  };

  const color = categoryColors[goal.category] || 'blue';
  const icon = categoryIcons[goal.category] || '🎯';
  const categoryLabel = categoryLabels[goal.category] || goal.category;

  // Formata valores
  const formatCurrency = value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formata data
  const formatDate = date => {
    if (!date) return 'Sem prazo';
    const d = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return d.toLocaleDateString('pt-BR');
  };

  // Determina cor dos dias restantes
  const getDaysColor = () => {
    if (daysRemaining === null) return 'text-gray-500';
    if (daysRemaining < 0) return 'text-red-500';
    if (daysRemaining < 30) return 'text-orange-500';
    if (daysRemaining < 90) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Texto dos dias restantes
  const getDaysText = () => {
    if (daysRemaining === null) return 'Sem prazo';
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)} dias atrasado`;
    if (daysRemaining === 0) return 'Vence hoje';
    if (daysRemaining === 1) return '1 dia restante';
    return `${daysRemaining} dias restantes`;
  };

  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
        isCompleted ? 'opacity-75' : ''
      } ${isPaused ? 'border-2 border-yellow-500' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {goal.name}
              {isCompleted && <FiCheck className="text-green-500" />}
              {isPaused && <FiPause className="text-yellow-500" />}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{categoryLabel}</span>
          </div>
        </div>

        {/* Ações */}
        {!isCompleted && (
          <div className="flex gap-2">
            {goal.status === 'active' && (
              <>
                <button
                  onClick={() => onEdit(goal)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => onPause(goal.id)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                  title="Pausar"
                >
                  <FiPause />
                </button>
              </>
            )}

            {goal.status === 'paused' && (
              <button
                onClick={() => onResume(goal.id)}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Retomar"
              >
                <FiPlay />
              </button>
            )}

            <button
              onClick={() => onDelete(goal.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Excluir"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      {/* Descrição */}
      {goal.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>
      )}

      {/* Progresso */}
      <ProgressBar percentage={percentage} color={color} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Atual</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Meta</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>
      </div>

      {/* Dias restantes e prazo */}
      {goal.deadline && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className={`font-medium ${getDaysColor()}`}>{getDaysText()}</span>
          <span className="text-gray-500 dark:text-gray-400">
            Prazo: {formatDate(goal.deadline)}
          </span>
        </div>
      )}

      {/* Botão de adicionar progresso */}
      {!isCompleted && goal.status === 'active' && (
        <button
          onClick={() => onUpdateProgress(goal)}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ➕ Adicionar Progresso
        </button>
      )}

      {/* Botão de concluir manualmente */}
      {!isCompleted && goal.status === 'active' && percentage >= 100 && (
        <button
          onClick={() => onComplete(goal.id)}
          className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ✓ Marcar como Concluída
        </button>
      )}

      {/* Badge de prioridade */}
      <div className="mt-4">
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            goal.priority === 1
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : goal.priority === 2
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          Prioridade {goal.priority}
        </span>
      </div>
    </div>
  );
}

GoalCard.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    targetAmount: PropTypes.number.isRequired,
    currentAmount: PropTypes.number.isRequired,
    deadline: PropTypes.object,
    category: PropTypes.oneOf(['debt', 'savings', 'investment', 'purchase']).isRequired,
    priority: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['active', 'paused', 'completed', 'abandoned']).isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateProgress: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};
