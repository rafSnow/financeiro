import PropTypes from 'prop-types';

/**
 * Componente de botão reutilizável
 * @param {Object} props
 * @param {string} props.variant - Variante do botão (primary, secondary, danger)
 * @param {boolean} props.loading - Estado de carregamento
 * @param {boolean} props.disabled - Estado desabilitado
 * @param {string} props.type - Tipo do botão (button, submit, reset)
 * @param {function} props.onClick - Função de clique
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @param {string} props.className - Classes adicionais
 */
const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      aria-busy={loading}
      aria-disabled={disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Button;
