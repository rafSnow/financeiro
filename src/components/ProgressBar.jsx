import PropTypes from 'prop-types';

/**
 * Barra de progresso reutilizável
 */
export default function ProgressBar({
  percentage,
  color = 'green',
  showLabel = true,
  height = 'h-2',
}) {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const bgColor = colorClasses[color] || colorClasses.green;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {safePercentage}%
          </span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${bgColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'yellow', 'orange', 'red', 'purple']),
  showLabel: PropTypes.bool,
  height: PropTypes.string,
};
