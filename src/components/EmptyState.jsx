import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Componente EmptyState
 * Exibe uma mensagem amigável quando não há dados
 */
const EmptyState = ({
  icon = '📭',
  title = 'Nenhum dado encontrado',
  description = '',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Ícone */}
      <div className="text-6xl mb-4 animate-bounce-slow text-gray-400 dark:text-gray-500">
        {icon}
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>

      {/* Descrição */}
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{description}</p>
      )}

      {/* Ação (botão opcional) */}
      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'primary'}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
  }),
};

export default EmptyState;
