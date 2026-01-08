import { create } from 'zustand';

/**
 * Store para gerenciar notificações toast
 */
export const useToastStore = create(set => ({
  toasts: [],

  /**
   * Adiciona um novo toast
   * @param {string} message - Mensagem do toast
   * @param {string} type - Tipo: success, error, warning, info
   * @param {number} duration - Duração em ms (padrão: 3000)
   */
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    // Auto-remover após duração
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(toast => toast.id !== id),
      }));
    }, duration);
  },

  /**
   * Remove um toast específico
   * @param {number} id - ID do toast
   */
  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  /**
   * Limpa todos os toasts
   */
  clearToasts: () => set({ toasts: [] }),
}));
