import toast from 'react-hot-toast';

/**
 * Hook customizado para toasts com react-hot-toast
 * Mantém compatibilidade com o sistema anterior
 */
export const useToast = () => {
  const addToast = (message, type = 'info') => {
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
  };

  return { addToast };
};
