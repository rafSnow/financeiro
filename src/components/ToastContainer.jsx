import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useToastStore } from '../store/toastStore';

/**
 * Componente Toast individual
 */
const Toast = ({ id, message, type, onClose }) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: '✅',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: '❌',
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: '⚠️',
      text: 'text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'ℹ️',
      text: 'text-blue-800',
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${style.bg} ${style.border} border-l-4 rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-right`}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <span className="text-xl shrink-0">{style.icon}</span>
      <p className={`flex-1 ${style.text} font-medium text-sm`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`${style.text} hover:opacity-70 transition-opacity shrink-0`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * Container de Toasts
 * Exibe todos os toasts ativos
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  // Adicionar estilos de animação ao documento
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full px-4">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
