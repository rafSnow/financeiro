import { create } from 'zustand';

/**
 * Store para gerenciamento de despesas
 */
export const useExpensesStore = create(set => ({
  expenses: [],
  loading: false,
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),

  // Ações
  setExpenses: expenses => set({ expenses }),

  addExpense: expense =>
    set(state => ({
      expenses: [expense, ...state.expenses],
    })),

  updateExpense: (id, updatedData) =>
    set(state => ({
      expenses: state.expenses.map(expense =>
        expense.id === id ? { ...expense, ...updatedData } : expense
      ),
    })),

  removeExpense: id =>
    set(state => ({
      expenses: state.expenses.filter(expense => expense.id !== id),
    })),

  setLoading: loading => set({ loading }),

  setCurrentMonth: month => set({ currentMonth: month }),

  setCurrentYear: year => set({ currentYear: year }),

  // Calculadora de totais
  getTotalByCategory: () => {
    const state = useExpensesStore.getState();
    const totals = {};

    state.expenses.forEach(expense => {
      const category = expense.category || 'outros';
      totals[category] = (totals[category] || 0) + expense.amount;
    });

    return totals;
  },

  getTotal: () => {
    const state = useExpensesStore.getState();
    return state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },
}));
