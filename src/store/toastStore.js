import toast from 'react-hot-toast';
import { create } from 'zustand';

/**
 * Store para gerenciar notificações toast
 * Agora usa react-hot-toast internamente
 */
export const useToastStore = create(() => ({
  /**
   * Adiciona um novo toast
   * @param {string} message - Mensagem do toast
   * @param {string} type - Tipo: success, error, warning, info
   */
  addToast: (message, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
        });
        break;
      case 'info':
      default:
        toast(message, {
          icon: 'ℹ️',
        });
        break;
    }
  },

  /**
   * Remove um toast específico (compatibilidade)
   * @param {string} id - ID do toast
   */
  removeToast: id => {
    toast.dismiss(id);
  },

  /**
   * Limpa todos os toasts
   */
  clearToasts: () => {
    toast.dismiss();
  },
}));
