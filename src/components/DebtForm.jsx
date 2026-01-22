import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';

/**
 * Formulário de Dívida
 * Cria ou edita uma dívida
 */
const DebtForm = ({ debt, onSubmit, onCancel, loading = false }) => {
  // Função auxiliar para preparar dados iniciais
  const getInitialFormData = () => {
    if (!debt) {
      return {
        name: '',
        totalAmount: '',
        installmentValue: '',
        totalInstallments: '',
        paidInstallments: '0',
        interestRate: '',
        dueDay: '',
        type: 'credit_card',
        priority: '',
      };
    }

    return {
      name: debt.name || '',
      totalAmount: debt.totalAmount?.toString().replace('.', ',') || '',
      installmentValue: debt.installmentValue?.toString().replace('.', ',') || '',
      totalInstallments: debt.totalInstallments?.toString() || '',
      paidInstallments: debt.paidInstallments?.toString() || '0',
      interestRate: debt.interestRate?.toString().replace('.', ',') || '',
      dueDay: debt.dueDay?.toString() || '',
      type: debt.type || 'credit_card',
      priority: debt.priority?.toString() || '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Atualizar formulário quando debt mudar
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debt?.id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAmountChange = (fieldName, value) => {
    // Remover tudo exceto números e vírgula
    value = value.replace(/[^\d,]/g, '');

    // Garantir apenas uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Limpar erro
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.totalAmount) {
      newErrors.totalAmount = 'Valor total é obrigatório';
    } else {
      const numericValue = parseFloat(formData.totalAmount.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.totalAmount = 'Valor deve ser maior que zero';
      }
    }

    if (!formData.installmentValue) {
      newErrors.installmentValue = 'Valor da parcela é obrigatório';
    } else {
      const numericValue = parseFloat(formData.installmentValue.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.installmentValue = 'Valor deve ser maior que zero';
      }
    }

    if (!formData.totalInstallments) {
      newErrors.totalInstallments = 'Número de parcelas é obrigatório';
    } else {
      const num = parseInt(formData.totalInstallments);
      if (isNaN(num) || num <= 0) {
        newErrors.totalInstallments = 'Número de parcelas inválido';
      }
    }

    if (!formData.dueDay) {
      newErrors.dueDay = 'Dia de vencimento é obrigatório';
    } else {
      const day = parseInt(formData.dueDay);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.dueDay = 'Dia deve estar entre 1 e 31';
      }
    }

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Converter valores para números
    const totalAmount = parseFloat(formData.totalAmount.replace(',', '.'));
    const installmentValue = parseFloat(formData.installmentValue.replace(',', '.'));
    const interestRate = formData.interestRate
      ? parseFloat(formData.interestRate.replace(',', '.'))
      : 0;

    // Calcular remainingAmount
    const paidInstallments = parseInt(formData.paidInstallments || 0);
    const totalInstallments = parseInt(formData.totalInstallments);
    const remainingAmount = totalAmount - paidInstallments * installmentValue;

    // Preparar dados para envio
    const dataToSubmit = {
      name: formData.name,
      totalAmount,
      remainingAmount: Math.max(0, remainingAmount),
      installmentValue,
      totalInstallments,
      paidInstallments,
      interestRate,
      dueDay: parseInt(formData.dueDay),
      type: formData.type,
      priority: formData.priority ? parseInt(formData.priority) : 999,
      status: remainingAmount <= 0 ? 'paid' : 'active',
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nome */}
      <Input
        label="Nome da Dívida"
        type="text"
        name="name"
        placeholder="Ex: Cartão Nubank"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        autoFocus
      />

      {/* Tipo */}
      <div className="w-full">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`w-full rounded-lg border transition-all duration-200 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            ${
              errors.type
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
          `}
        >
          <option value="credit_card">💳 Cartão de Crédito</option>
          <option value="loan">🏦 Empréstimo</option>
          <option value="financing">🏠 Financiamento</option>
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor Total */}
        <div className="w-full">
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valor Total <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 pointer-events-none">
              R$
            </span>
            <input
              id="totalAmount"
              name="totalAmount"
              type="text"
              placeholder="0,00"
              value={formData.totalAmount}
              onChange={e => handleAmountChange('totalAmount', e.target.value)}
              className={`w-full rounded-lg border transition-all duration-200 pl-12 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${
                  errors.totalAmount
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:ring-2 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500
              `}
            />
          </div>
          {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>}
        </div>

        {/* Valor da Parcela */}
        <div className="w-full">
          <label
            htmlFor="installmentValue"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Valor da Parcela <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 pointer-events-none">
              R$
            </span>
            <input
              id="installmentValue"
              name="installmentValue"
              type="text"
              placeholder="0,00"
              value={formData.installmentValue}
              onChange={e => handleAmountChange('installmentValue', e.target.value)}
              className={`w-full rounded-lg border transition-all duration-200 pl-12 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${
                  errors.installmentValue
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
                focus:ring-2 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500
              `}
            />
          </div>
          {errors.installmentValue && (
            <p className="mt-1 text-sm text-red-600">{errors.installmentValue}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total de Parcelas */}
        <Input
          label="Total de Parcelas"
          type="number"
          name="totalInstallments"
          placeholder="12"
          value={formData.totalInstallments}
          onChange={handleChange}
          error={errors.totalInstallments}
          required
        />

        {/* Parcelas Pagas */}
        <Input
          label="Parcelas Pagas"
          type="number"
          name="paidInstallments"
          placeholder="0"
          value={formData.paidInstallments}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Taxa de Juros */}
        <div className="w-full">
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taxa de Juros (% ao ano)
          </label>
          <input
            id="interestRate"
            name="interestRate"
            type="text"
            placeholder="0,00"
            value={formData.interestRate}
            onChange={e => handleAmountChange('interestRate', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 focus:ring-2 focus:outline-none px-4 py-3 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200"
          />
        </div>

        {/* Dia do Vencimento */}
        <Input
          label="Dia do Vencimento"
          type="number"
          name="dueDay"
          placeholder="15"
          value={formData.dueDay}
          onChange={handleChange}
          error={errors.dueDay}
          required
          min="1"
          max="31"
        />
      </div>

      {/* Prioridade */}
      <Input
        label="Prioridade (opcional)"
        type="number"
        name="priority"
        placeholder="1 para maior prioridade"
        value={formData.priority}
        onChange={handleChange}
        helperText="Menor número = maior prioridade (método snowball)"
      />

      {/* Botões */}
      <div className="flex gap-3 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {debt ? 'Atualizar' : 'Adicionar'} Dívida
        </Button>
      </div>
    </form>
  );
};

DebtForm.propTypes = {
  debt: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default DebtForm;
