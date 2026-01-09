import PropTypes from 'prop-types';
import { useState } from 'react';
import { FiCheck, FiFilter, FiTrash2, FiX } from 'react-icons/fi';

/**
 * Lista de alertas com filtros
 */
export default function AlertList({
  alerts,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onDeleteRead,
  onClose,
}) {
  const [filter, setFilter] = useState('all'); // all | unread | read

  // Filtra alertas
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'read') return alert.isRead;
    return true;
  });

  // Ícones por tipo
  const getIcon = type => {
    switch (type) {
      case 'overspending':
        return '💸';
      case 'debt_due':
        return '📅';
      case 'debt_overdue':
        return '🚨';
      case 'goal_reached':
        return '🎉';
      case 'goal_near':
        return '🎯';
      case 'high_interest':
        return '💸';
      default:
        return '📢';
    }
  };

  // Cores por severidade
  const getSeverityColor = severity => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  // Formata data
  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `há ${minutes} min`;
    }
    if (diffInHours < 24) {
      return `há ${Math.floor(diffInHours)} h`;
    }
    if (diffInHours < 48) {
      return 'ontem';
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const readCount = alerts.filter(a => a.isRead).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mt-16">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Alertas {unreadCount > 0 && `(${unreadCount})`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Filtros e Ações */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Não lidos ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === 'read'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Lidos ({readCount})
            </button>
          </div>

          {/* Ações em massa */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <FiCheck size={14} />
                Marcar todas como lidas
              </button>
            )}
            {readCount > 0 && (
              <button
                onClick={onDeleteRead}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FiTrash2 size={14} />
                Limpar lidas
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">🔔</p>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread'
                  ? 'Nenhum alerta não lido'
                  : filter === 'read'
                  ? 'Nenhum alerta lido'
                  : 'Nenhum alerta'}
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg border-2 p-4 transition-all ${getSeverityColor(
                  alert.severity
                )} ${alert.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Ícone */}
                  <span className="text-2xl shrink-0">{getIcon(alert.type)}</span>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{alert.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-1 shrink-0">
                    {!alert.isRead && (
                      <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Marcar como lida"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']).isRequired,
      isRead: PropTypes.bool.isRequired,
      createdAt: PropTypes.object,
    })
  ).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
  onDeleteRead: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
