import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de Rendas usando Zustand
 */
export const useIncomeStore = create(
  persist(
    set => ({
      incomes: [],
      loading: false,
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),

      setIncomes: incomes => set({ incomes }),
      setLoading: loading => set({ loading }),
      setCurrentMonth: month => set({ currentMonth: month }),
      setCurrentYear: year => set({ currentYear: year }),

      addIncome: income => set(state => ({ incomes: [income, ...state.incomes] })),

      updateIncome: updatedIncome =>
        set(state => ({
          incomes: state.incomes.map(income =>
            income.id === updatedIncome.id ? { ...income, ...updatedIncome } : income
          ),
        })),

      removeIncome: incomeId =>
        set(state => ({
          incomes: state.incomes.filter(income => income.id !== incomeId),
        })),

      getTotal: () => {
        const state = useIncomeStore.getState();
        return state.incomes.reduce((total, income) => total + (income.amount || 0), 0);
      },

      getTotalByType: () => {
        const state = useIncomeStore.getState();
        const totals = { salary: 0, extra: 0 };

        state.incomes.forEach(income => {
          if (income.type === 'salary') {
            totals.salary += income.amount || 0;
          } else {
            totals.extra += income.amount || 0;
          }
        });

        return totals;
      },

      getTotalReceived: () => {
        const state = useIncomeStore.getState();
        return state.incomes
          .filter(income => income.received)
          .reduce((total, income) => total + (income.amount || 0), 0);
      },

      getTotalPending: () => {
        const state = useIncomeStore.getState();
        return state.incomes
          .filter(income => !income.received)
          .reduce((total, income) => total + (income.amount || 0), 0);
      },
    }),
    {
      name: 'income-storage',
    }
  )
);
