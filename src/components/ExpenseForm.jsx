import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { DEFAULT_CATEGORIES } from '../services/categories.service';
import { PAYMENT_METHODS } from '../utils/constants';
import { suggestCategories } from '../services/autoCategorization.service';
import { saveCategorizationHistory } from '../services/categorizationHistory.service';
import { useAuthStore } from '../store/authStore';
import Button from './Button';
import CategorySuggestionChip from './CategorySuggestionChip';
import Input from './Input';

/**
 * Formulário de Despesa
 * Cria ou edita uma despesa
 */
const ExpenseForm = ({ expense, onSubmit, onCancel, loading = false }) => {
  // Função auxiliar para preparar dados iniciais
  const getInitialFormData = () => {
    if (!expense) {
      return {
        description: '',
        amount: '',
        category: '',
        paymentMethod: '',
        date: '',
        isFixed: false,
      };
    }

    // Converter Timestamp do Firebase para string de data
    let dateString = '';
    if (expense.date) {
      const date = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }

    return {
      description: expense.description || '',
      amount: expense.amount?.toString().replace('.', ',') || '',
      category: expense.category || '',
      paymentMethod: expense.paymentMethod || '',
      date: dateString,
      isFixed: expense.isFixed || false,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const user = useAuthStore(state => state.user);

  // Atualizar formulário quando expense mudar
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setSuggestions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense?.id]);

  // Auto-sugerir categorias ao digitar descrição
  useEffect(() => {
    const getSuggestions = async () => {
      if (!formData.description || formData.description.length < 3 || !user?.uid) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        const suggested = await suggestCategories(formData.description, user.uid);
        setSuggestions(suggested || []);

        // Auto-selecionar se confiança > 90% e categoria não estiver selecionada
        if (suggested?.length > 0 && suggested[0].confidence > 0.9 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: suggested[0].category,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Debounce: aguardar 500ms após parar de digitar
    const debounceTimer = setTimeout(getSuggestions, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.description, user?.uid]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpar erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAmountChange = e => {
    let value = e.target.value;

    // Remover tudo exceto números e vírgula
    value = value.replace(/[^\d,]/g, '');

    // Garantir apenas uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }

    setFormData(prev => ({
      ...prev,
      amount: value,
    }));

    // Limpar erro
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const numericValue = parseFloat(formData.amount.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.date = 'Data não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Converter valor para número
    const numericAmount = parseFloat(formData.amount.replace(',', '.'));

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      amount: numericAmount,
      date: new Date(formData.date),
    };

    // Salvar histórico de categorização se houver sugestão
    if (user?.uid && formData.description && formData.category) {
      const suggestedCategory = suggestions[0]?.category;
      
      if (suggestedCategory) {
        saveCategorizationHistory(user.uid, {
          description: formData.description,
          suggestedCategory,
          finalCategory: formData.category,
          wasCorrected: suggestedCategory !== formData.category,
          confidence: suggestions[0]?.confidence || 0,
          method: suggestions[0]?.source || 'unknown',
        }).catch(err => console.error('Erro ao salvar histórico:', err));
      }
    }

    onSubmit(dataToSubmit);
  };

  const handleSuggestionClick = category => {
    setFormData(prev => ({
      ...prev,
      category,
    }));

    // Limpar erro de categoria
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Descrição */}
      <Input
        label="Descrição"
        type="text"
        name="description"
        placeholder="Ex: Compras no mercado"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        autoFocus
      />

      {/* Sugestões de Categoria */}
      {suggestions.length > 0 && (
        <div className="w-full">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Sugestões de Categoria
            {isLoadingSuggestions && (
              <span className="ml-2 text-blue-500 text-xs">Carregando...</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => (
              <CategorySuggestionChip
                key={suggestion.category}
                category={suggestion.category}
                confidence={suggestion.confidence}
                isSelected={formData.category === suggestion.category}
                onClick={() => handleSuggestionClick(suggestion.category)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Valor */}
      <div className="w-full">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Valor <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
            R$
          </span>
          <input
            id="amount"
            name="amount"
            type="text"
            placeholder="0,00"
            value={formData.amount}
            onChange={handleAmountChange}
            className={`w-full rounded-lg border transition-all duration-200 pl-12 pr-4 py-3
              ${
                errors.amount
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
              focus:ring-2 focus:outline-none placeholder:text-gray-400
            `}
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      {/* Categoria */}
      <div className="w-full">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Categoria <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full rounded-lg border transition-all duration-200 px-4 py-3
            ${
              errors.category
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
          `}
        >
          <option value="">Selecione uma categoria</option>
          {DEFAULT_CATEGORIES.map(cat => (
            <option key={cat.name} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Forma de Pagamento */}
      <div className="w-full">
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
          Forma de Pagamento <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className={`w-full rounded-lg border transition-all duration-200 px-4 py-3
            ${
              errors.paymentMethod
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
          `}
        >
          <option value="">Selecione a forma de pagamento</option>
          {PAYMENT_METHODS.map(method => (
            <option key={method.name} value={method.name}>
              {method.name}
            </option>
          ))}
        </select>
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
        )}
      </div>

      {/* Data */}
      <div className="w-full">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Data <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full rounded-lg border transition-all duration-200 px-4 py-3
            ${
              errors.date
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
          `}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      {/* Despesa Fixa */}
      <div className="flex items-center gap-3">
        <input
          id="isFixed"
          name="isFixed"
          type="checkbox"
          checked={formData.isFixed}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="isFixed" className="text-sm font-medium text-gray-700">
          Despesa fixa (repete todo mês)
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-3 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {expense ? 'Atualizar' : 'Adicionar'} Despesa
        </Button>
      </div>
    </form>
  );
};

ExpenseForm.propTypes = {
  expense: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ExpenseForm;
