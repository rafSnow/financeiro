import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * Hook para acessar o contexto de tema
 * @returns {Object} { theme, toggleTheme, isDark }
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Verificar preferência salva ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    console.log('🎨 [ThemeContext INIT] localStorage theme:', savedTheme);
    if (savedTheme) return savedTheme;

    // Detectar preferência do sistema
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('🎨 [ThemeContext INIT] System prefers dark:', prefersDark);
    if (prefersDark) {
      return 'dark';
    }

    console.log('🎨 [ThemeContext INIT] Defaulting to light');
    return 'light';
  });

  useEffect(() => {
    console.log('🔄 [ThemeContext useEffect] Theme changed to:', theme);

    // Salvar preferência
    localStorage.setItem('theme', theme);
    console.log('💾 [ThemeContext] Saved to localStorage:', theme);

    // Log classes antes
    const classesBefore = document.documentElement.className;
    console.log('📋 [ThemeContext] HTML classes BEFORE:', classesBefore);

    // Aplicar classe no HTML
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('➕ [ThemeContext] Added "dark" class');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('➖ [ThemeContext] Removed "dark" class');
    }

    // Log classes depois
    const classesAfter = document.documentElement.className;
    console.log('📋 [ThemeContext] HTML classes AFTER:', classesAfter);

    // Verificar computed styles
    const htmlStyles = window.getComputedStyle(document.documentElement);
    console.log(
      '🎨 [ThemeContext] Computed --color-bg-primary:',
      htmlStyles.getPropertyValue('--color-bg-primary')
    );
    console.log(
      '🎨 [ThemeContext] Computed --color-bg-secondary:',
      htmlStyles.getPropertyValue('--color-bg-secondary')
    );
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 [toggleTheme] Toggling from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
