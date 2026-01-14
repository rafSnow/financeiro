import PropTypes from 'prop-types';
import { DEFAULT_CATEGORIES } from '../services/categories.service';

/**
 * Chip de sugestão de categoria
 * Mostra ícone, nome e confiança da sugestão
 */
const CategorySuggestionChip = ({ category, confidence, isSelected, onClick }) => {
  // Buscar dados da categoria
  const categoryData = DEFAULT_CATEGORIES.find(cat => cat.name === category) || {
    name: category,
    icon: '📦',
    color: '#64748B',
  };

  const percentage = Math.round(confidence * 100);

  // Determinar cor do indicador de confiança
  const getConfidenceColor = () => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        border-2 transition-all duration-200
        hover:shadow-md hover:scale-105
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* Ícone da categoria */}
      <span className="text-2xl" role="img" aria-label={categoryData.name}>
        {categoryData.icon}
      </span>

      {/* Nome da categoria */}
      <span
        className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}
      >
        {categoryData.name}
      </span>

      {/* Indicador de confiança */}
      <span
        className={`
          ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold
          ${getConfidenceColor()} text-white
        `}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {percentage}%
      </span>
    </button>
  );
};

CategorySuggestionChip.propTypes = {
  category: PropTypes.string.isRequired,
  confidence: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

CategorySuggestionChip.defaultProps = {
  isSelected: false,
};

export default CategorySuggestionChip;
