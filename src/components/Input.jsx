import PropTypes from 'prop-types';

/**
 * Componente de input reutilizável
 * @param {Object} props
 * @param {string} props.label - Label do input
 * @param {string} props.type - Tipo do input (text, email, password, number)
 * @param {string} props.placeholder - Placeholder do input
 * @param {string} props.value - Valor do input
 * @param {function} props.onChange - Função de mudança de valor
 * @param {string} props.error - Mensagem de erro
 * @param {React.ReactNode} props.icon - Ícone do input
 * @param {boolean} props.required - Campo obrigatório
 * @param {string} props.name - Nome do input
 * @param {boolean} props.disabled - Campo desabilitado
 * @param {string} props.className - Classes adicionais
 */
const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  name,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={icon ? { paddingLeft: '2.5rem' } : {}}
          className={`
            w-full rounded-lg border transition-all duration-200
            ${icon ? 'pr-4 py-3' : 'px-4 py-3'}
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder:text-gray-400
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel']),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  icon: PropTypes.node,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
