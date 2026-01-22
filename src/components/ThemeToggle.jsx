import { useTheme } from '../contexts/ThemeContext';

/**
 * Componente de toggle para alternar entre modo claro e escuro
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  console.log('🎨 [ThemeToggle RENDER] Current theme:', theme);

  const handleClick = () => {
    console.log('🖱️ [ThemeToggle] Button clicked! Current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="theme-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Modo ${theme === 'light' ? 'Escuro' : 'Claro'}`}
    >
      <span className="text-2xl transition-transform duration-300 hover:scale-110 inline-block">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default ThemeToggle;
