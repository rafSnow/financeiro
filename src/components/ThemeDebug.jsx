import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Componente de debug visual para o sistema de temas
 * Mostra informações em tempo real sobre o estado do tema
 */
const ThemeDebug = () => {
  const { theme, isDark } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState('');
  const [computedVars, setComputedVars] = useState({});

  useEffect(() => {
    // Atualizar classes do HTML
    setHtmlClasses(document.documentElement.className);

    // Pegar variáveis CSS computadas
    const styles = window.getComputedStyle(document.documentElement);
    setComputedVars({
      bgPrimary: styles.getPropertyValue('--color-bg-primary').trim(),
      bgSecondary: styles.getPropertyValue('--color-bg-secondary').trim(),
      textPrimary: styles.getPropertyValue('--color-text-primary').trim(),
    });
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-2xl border border-white/20 max-w-md text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">🔧 Theme Debug</h3>
        <span
          className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white text-black'}`}
        >
          {theme.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Context theme:</span>{' '}
          <span className="text-green-400">{theme}</span>
        </div>
        <div>
          <span className="text-gray-400">Context isDark:</span>{' '}
          <span className="text-green-400">{String(isDark)}</span>
        </div>
        <div>
          <span className="text-gray-400">HTML classes:</span>{' '}
          <span className="text-yellow-400">"{htmlClasses}"</span>
        </div>
        <div>
          <span className="text-gray-400">localStorage:</span>{' '}
          <span className="text-blue-400">{localStorage.getItem('theme')}</span>
        </div>

        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="text-gray-400 mb-1">CSS Variables:</div>
          <div className="pl-2 space-y-1">
            <div>
              <span className="text-gray-400">--color-bg-primary:</span>
              <span className="text-purple-400"> {computedVars.bgPrimary}</span>
            </div>
            <div>
              <span className="text-gray-400">--color-bg-secondary:</span>
              <span className="text-purple-400"> {computedVars.bgSecondary}</span>
            </div>
            <div>
              <span className="text-gray-400">--color-text-primary:</span>
              <span className="text-purple-400"> {computedVars.textPrimary}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="text-gray-400 mb-1">Tailwind Test:</div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
            <div className="w-8 h-8 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded"></div>
            <div className="flex-1 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 p-1 rounded text-center">
              Text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDebug;
