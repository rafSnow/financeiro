import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store para gerenciar metas
 */
export const useGoalsStore = create(
  persist(
    set => ({
      goals: [],
      loading: false,

      setGoals: goals => set({ goals }),
      setLoading: loading => set({ loading }),

      /**
       * Retorna metas ativas
       */
      getActiveGoals: () => {
        const { goals } = useGoalsStore.getState();
        return goals.filter(g => g.status === 'active');
      },

      /**
       * Retorna metas concluídas
       */
      getCompletedGoals: () => {
        const { goals } = useGoalsStore.getState();
        return goals.filter(g => g.status === 'completed');
      },

      /**
       * Retorna metas pausadas
       */
      getPausedGoals: () => {
        const { goals } = useGoalsStore.getState();
        return goals.filter(g => g.status === 'paused');
      },

      /**
       * Retorna meta por ID
       */
      getGoalById: goalId => {
        const { goals } = useGoalsStore.getState();
        return goals.find(g => g.id === goalId);
      },

      /**
       * Retorna meta por categoria
       */
      getGoalByCategory: category => {
        const { goals } = useGoalsStore.getState();
        return goals.find(g => g.category === category && g.status === 'active');
      },

      /**
       * Calcula percentual de conclusão
       */
      getGoalPercentage: goalId => {
        const { goals } = useGoalsStore.getState();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return 0;
        return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
      },

      /**
       * Calcula dias restantes
       */
      getDaysRemaining: goalId => {
        const { goals } = useGoalsStore.getState();
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.deadline) return null;

        const deadline = goal.deadline.toDate
          ? goal.deadline.toDate()
          : new Date(goal.deadline.seconds * 1000);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
      },
    }),
    {
      name: 'goals-storage',
    }
  )
);
