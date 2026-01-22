import {
  FaBolt,
  FaBook,
  FaBox,
  FaCar,
  FaGamepad,
  FaHome,
  FaPills,
  FaUtensils,
} from 'react-icons/fa';

/**
 * Categorias padrão de despesas
 */
export const DEFAULT_CATEGORIES = [
  { id: 'moradia', name: 'Moradia', icon: FaHome, color: '#3B82F6' },
  { id: 'alimentacao', name: 'Alimentação', icon: FaUtensils, color: '#10B981' },
  { id: 'transporte', name: 'Transporte', icon: FaCar, color: '#F59E0B' },
  { id: 'contas', name: 'Contas', icon: FaBolt, color: '#EF4444' },
  { id: 'lazer', name: 'Lazer', icon: FaGamepad, color: '#8B5CF6' },
  { id: 'saude', name: 'Saúde', icon: FaPills, color: '#EC4899' },
  { id: 'educacao', name: 'Educação', icon: FaBook, color: '#14B8A6' },
  { id: 'outros', name: 'Outros', icon: FaBox, color: '#6B7280' },
];

/**
 * Métodos de pagamento
 */
export const PAYMENT_METHODS = [
  { id: 'dinheiro', name: 'Dinheiro' },
  { id: 'debito', name: 'Débito' },
  { id: 'credito', name: 'Crédito' },
  { id: 'pix', name: 'PIX' },
  { id: 'transferencia', name: 'Transferência' },
  { id: 'boleto', name: 'Boleto' },
];

/**
 * Obtém categoria por ID
 */
export const getCategoryById = categoryId => {
  return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || DEFAULT_CATEGORIES[7]; // outros
};

/**
 * Formata valor em reais
 */
export const formatCurrency = value => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata data
 */
export const formatDate = date => {
  if (!date) return '';

  // Se for Timestamp do Firebase
  if (date.toDate && typeof date.toDate === 'function') {
    date = date.toDate();
  }

  // Validar se a data é válida
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
};

/**
 * Obtém nome do mês
 */
export const getMonthName = monthNumber => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[monthNumber - 1] || '';
};
