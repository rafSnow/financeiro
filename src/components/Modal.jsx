import PropTypes from 'prop-types';
import { useEffect } from 'react';

/**
 * Componente Modal reutilizável
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado do modal (aberto/fechado)
 * @param {function} props.onClose - Função para fechar o modal
 * @param {string} props.title - Título do modal
 * @param {React.ReactNode} props.children - Conteúdo do modal
 * @param {string} props.size - Tamanho do modal (sm, md, lg)
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900 dark:bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full transform transition-all`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
            style={{ padding: '1.5rem' }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Fechar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem' }}>{children}</div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

export default Modal;
