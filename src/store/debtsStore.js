import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de Dívidas usando Zustand
 */
export const useDebtsStore = create(
  persist(
    set => ({
      debts: [],
      loading: false,

      setDebts: debts => set({ debts }),
      setLoading: loading => set({ loading }),

      addDebt: debt => set(state => ({ debts: [debt, ...state.debts] })),

      updateDebt: updatedDebt =>
        set(state => ({
          debts: state.debts.map(debt =>
            debt.id === updatedDebt.id ? { ...debt, ...updatedDebt } : debt
          ),
        })),

      removeDebt: debtId =>
        set(state => ({
          debts: state.debts.filter(debt => debt.id !== debtId),
        })),

      getActiveDebts: () => {
        const state = useDebtsStore.getState();
        return state.debts.filter(debt => debt.status === 'active');
      },

      getTotalDebt: () => {
        const state = useDebtsStore.getState();
        return state.debts
          .filter(debt => debt.status === 'active')
          .reduce((total, debt) => total + (debt.remainingAmount || 0), 0);
      },

      getTotalMonthlyPayment: () => {
        const state = useDebtsStore.getState();
        return state.debts
          .filter(debt => debt.status === 'active')
          .reduce((total, debt) => total + (debt.installmentValue || 0), 0);
      },

      getTotalInterest: () => {
        const state = useDebtsStore.getState();
        return state.debts
          .filter(debt => debt.status === 'active')
          .reduce((total, debt) => {
            const monthlyInterest = (debt.remainingAmount * (debt.interestRate / 100)) / 12;
            return total + monthlyInterest;
          }, 0);
      },

      getDebtsByType: () => {
        const state = useDebtsStore.getState();
        const types = {};

        state.debts
          .filter(debt => debt.status === 'active')
          .forEach(debt => {
            if (!types[debt.type]) {
              types[debt.type] = 0;
            }
            types[debt.type] += debt.remainingAmount || 0;
          });

        return types;
      },
    }),
    {
      name: 'debts-storage',
    }
  )
);
