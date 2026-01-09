import PropTypes from 'prop-types';
import { FiBell } from 'react-icons/fi';

/**
 * Badge de notificação com contagem
 */
export default function AlertBadge({ count, onClick }) {
  const hasUnread = count > 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      title={hasUnread ? `${count} alerta(s) não lido(s)` : 'Sem alertas'}
    >
      <FiBell size={24} />

      {hasUnread && (
        <>
          {/* Badge de contagem */}
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-5 z-10">
            {count > 99 ? '99+' : count}
          </span>

          {/* Pulsação - removida para evitar sobreposição */}
        </>
      )}
    </button>
  );
}

AlertBadge.propTypes = {
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  showPulse: PropTypes.bool,
};
