import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

const AVAILABLE_EMOJIS = [
  '🍔',
  '🍕',
  '☕',
  '🍜',
  '🥗', // Alimentação
  '🚗',
  '🚌',
  '🚕',
  '🚲',
  '⛽', // Transporte
  '🏠',
  '🏢',
  '🔑',
  '🛋️',
  '🚪', // Moradia
  '💊',
  '🏥',
  '💉',
  '🩺',
  '🦷', // Saúde
  '📚',
  '✏️',
  '🎓',
  '📖',
  '🖊️', // Educação
  '🎮',
  '🎬',
  '🎵',
  '⚽',
  '🎨', // Lazer
  '👕',
  '👗',
  '👟',
  '👔',
  '🧥', // Vestuário
  '⚙️',
  '🔧',
  '💼',
  '📱',
  '💻', // Serviços
  '💰',
  '💳',
  '🏦',
  '📊',
  '💸', // Finanças
  '🎁',
  '🎉',
  '🎈',
  '🎂',
  '🎊', // Presentes/Festas
  '🐕',
  '🐈',
  '🐾',
  '🌱',
  '🌺', // Pets/Plantas
  '📦',
  '🔖',
  '📌',
  '🔔',
  '⭐', // Outros
];

const AVAILABLE_COLORS = [
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F59E0B' },
  { name: 'Amarelo', value: '#FBBF24' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ciano', value: '#14B8A6' },
  { name: 'Cinza', value: '#64748B' },
];

export default function CategoryForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.icon || '📦',
    color: initialData?.color || '#64748B',
    budgetLimit: initialData?.budgetLimit || '',
    type: initialData?.type || 'variable',
  });

  const [errors, setErrors] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmojiSelect = emoji => {
    setFormData(prev => ({ ...prev, icon: emoji }));
    setShowEmojiPicker(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.budgetLimit && Number(formData.budgetLimit) < 0) {
      newErrors.budgetLimit = 'Limite deve ser positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...formData,
      budgetLimit: formData.budgetLimit ? Number(formData.budgetLimit) : 0,
    });

    // Reset form
    setFormData({
      name: '',
      icon: '📦',
      color: '#64748B',
      budgetLimit: '',
      type: 'variable',
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || '',
      icon: initialData?.icon || '📦',
      color: initialData?.color || '#64748B',
      budgetLimit: initialData?.budgetLimit || '',
      type: initialData?.type || 'variable',
    });
    setErrors({});
    setShowEmojiPicker(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Editar Categoria' : 'Nova Categoria'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <Input
          label="Nome"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex: Streaming"
          required
        />

        {/* Ícone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ícone</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-16 h-16 text-3xl bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              {formData.icon}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Clique para escolher um emoji</span>
          </div>

          {showEmojiPicker && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {AVAILABLE_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`text-2xl p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                      formData.icon === emoji ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor</label>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                className={`h-10 rounded-lg transition-all ${
                  formData.color === color.value
                    ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-gray-900 dark:ring-gray-100 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Despesa</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'fixed' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'fixed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Fixa
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'variable' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'variable'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Variável
            </button>
          </div>
        </div>

        {/* Limite Mensal */}
        <Input
          label="Limite Mensal (opcional)"
          type="number"
          name="budgetLimit"
          value={formData.budgetLimit}
          onChange={handleChange}
          error={errors.budgetLimit}
          placeholder="0.00"
          step="0.01"
          min="0"
        />

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
