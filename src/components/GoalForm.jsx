import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Formulário para criar/editar meta
 */
export default function GoalForm({ goal, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'savings',
    priority: 3,
  });

  const [errors, setErrors] = useState({});

  // Preenche formulário se estiver editando
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        targetAmount: goal.targetAmount || '',
        deadline: goal.deadline
          ? goal.deadline.toDate
            ? goal.deadline.toDate().toISOString().split('T')[0]
            : new Date(goal.deadline.seconds * 1000).toISOString().split('T')[0]
          : '',
        category: goal.category || 'savings',
        priority: goal.priority || 3,
      });
    }
  }, [goal]);

  // Atualiza campo
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Valida formulário
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Valor da meta deve ser maior que zero';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.priority || formData.priority < 1 || formData.priority > 5) {
      newErrors.priority = 'Prioridade deve ser entre 1 e 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submete formulário
  const handleSubmit = e => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepara dados
    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      targetAmount: parseFloat(formData.targetAmount),
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      category: formData.category,
      priority: parseInt(formData.priority),
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Meta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Viagem para Europa"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes sobre a meta..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Valor da Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor da Meta <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            {errors.targetAmount && (
              <p className="mt-1 text-sm text-red-500">{errors.targetAmount}</p>
            )}
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prazo
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="debt">💳 Dívida</option>
              <option value="savings">💰 Poupança</option>
              <option value="investment">📈 Investimento</option>
              <option value="purchase">🛒 Compra</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridade <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="1">1 - Alta</option>
              <option value="2">2 - Média-Alta</option>
              <option value="3">3 - Média</option>
              <option value="4">4 - Média-Baixa</option>
              <option value="5">5 - Baixa</option>
            </select>
            {errors.priority && <p className="mt-1 text-sm text-red-500">{errors.priority}</p>}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {goal ? 'Salvar' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

GoalForm.propTypes = {
  goal: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
