import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';

/**
 * Formulário de Renda
 * Cria ou edita uma renda
 */
const IncomeForm = ({ income, onSubmit, onCancel, loading = false }) => {
  // Função auxiliar para preparar dados iniciais
  const getInitialFormData = () => {
    if (!income) {
      return {
        description: '',
        amount: '',
        type: 'salary',
        date: '',
        received: false,
      };
    }

    // Converter Timestamp do Firebase para string de data
    let dateString = '';
    if (income.date) {
      const date = income.date.toDate ? income.date.toDate() : new Date(income.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }

    return {
      description: income.description || '',
      amount: income.amount?.toString().replace('.', ',') || '',
      type: income.type || 'salary',
      date: dateString,
      received: income.received || false,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Atualizar formulário quando income mudar
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income?.id]);

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

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
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

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Tipo */}
      <div className="w-full">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`w-full rounded-lg border transition-all duration-200 px-4 py-3
            ${
              errors.type
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
          `}
        >
          <option value="salary">💼 Salário</option>
          <option value="extra">💰 Renda Extra</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* Descrição */}
      <Input
        label="Descrição"
        type="text"
        name="description"
        placeholder="Ex: Salário Janeiro 2026"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
      />

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

      {/* Status Recebido */}
      <div className="flex items-center gap-3">
        <input
          id="received"
          name="received"
          type="checkbox"
          checked={formData.received}
          onChange={handleChange}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
        />
        <label htmlFor="received" className="text-sm font-medium text-gray-700">
          ✅ Recebido
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-3 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {income ? 'Atualizar' : 'Adicionar'} Renda
        </Button>
      </div>
    </form>
  );
};

IncomeForm.propTypes = {
  income: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default IncomeForm;
