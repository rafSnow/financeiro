/**
 * Utilitário de Feedback Háptico (Vibração)
 * Fornece feedback tátil em dispositivos móveis para ações do usuário
 */

/**
 * Padrões de vibração predefinidos
 */
const VIBRATION_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [50, 100, 50],
  warning: [30, 50, 30],
  click: [5],
  doubleClick: [10, 30, 10],
};

/**
 * Verifica se a Vibration API está disponível
 * @returns {boolean}
 */
export const isHapticsSupported = () => {
  return 'vibrate' in navigator;
};

/**
 * Dispara feedback háptico com padrão especificado
 * @param {string|number[]} type - Tipo do padrão ou array customizado [duration, pause, duration, ...]
 * @returns {boolean} - true se a vibração foi disparada, false caso contrário
 *
 * @example
 * hapticFeedback('success'); // Vibração de sucesso
 * hapticFeedback('error');   // Vibração de erro
 * hapticFeedback([100, 50, 100]); // Padrão customizado
 */
export const hapticFeedback = (type = 'light') => {
  if (!isHapticsSupported()) {
    return false;
  }

  try {
    // Se type é um array, usa diretamente
    if (Array.isArray(type)) {
      navigator.vibrate(type);
      return true;
    }

    // Usa padrão predefinido
    const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.light;
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn('Erro ao disparar haptic feedback:', error);
    return false;
  }
};

/**
 * Para qualquer vibração em andamento
 */
export const stopHapticFeedback = () => {
  if (isHapticsSupported()) {
    navigator.vibrate(0);
  }
};

/**
 * Hook React para usar haptic feedback
 * @returns {object} Objeto com funções de haptic feedback
 *
 * @example
 * const haptics = useHaptics();
 * <Button onClick={() => {
 *   deleteExpense(id);
 *   haptics.success();
 * }}>Deletar</Button>
 */
export const useHaptics = () => {
  return {
    light: () => hapticFeedback('light'),
    medium: () => hapticFeedback('medium'),
    heavy: () => hapticFeedback('heavy'),
    success: () => hapticFeedback('success'),
    error: () => hapticFeedback('error'),
    warning: () => hapticFeedback('warning'),
    click: () => hapticFeedback('click'),
    doubleClick: () => hapticFeedback('doubleClick'),
    custom: pattern => hapticFeedback(pattern),
    stop: stopHapticFeedback,
    isSupported: isHapticsSupported(),
  };
};

/**
 * Wrapper de função com haptic feedback
 * Executa uma função e dispara vibração
 *
 * @param {Function} fn - Função a ser executada
 * @param {string} hapticType - Tipo de vibração a disparar
 * @returns {Function} Função wrapper
 *
 * @example
 * const handleDelete = withHaptic(deleteExpense, 'error');
 * <Button onClick={() => handleDelete(id)}>Deletar</Button>
 */
export const withHaptic = (fn, hapticType = 'light') => {
  return (...args) => {
    hapticFeedback(hapticType);
    return fn(...args);
  };
};

export default {
  hapticFeedback,
  stopHapticFeedback,
  useHaptics,
  withHaptic,
  isHapticsSupported,
  VIBRATION_PATTERNS,
};
