import { useState } from 'react';
import Button from './Button';

/**
 * Componente para mapear colunas de CSV customizado
 * Permite ao usuário definir qual coluna corresponde a cada campo
 */
const ColumnMapper = ({ headers, onMappingComplete, onCancel, initialMapping = null }) => {
  const [mapping, setMapping] = useState(
    initialMapping || {
      dateColumn: '',
      descriptionColumn: '',
      amountColumn: '',
      categoryColumn: '',
    }
  );

  const [saveMappingName, setSaveMappingName] = useState('');
  const [shouldSave, setShouldSave] = useState(false);

  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!mapping.dateColumn || !mapping.descriptionColumn || !mapping.amountColumn) {
      alert('Por favor, preencha os campos obrigatórios: Data, Descrição e Valor');
      return;
    }

    onMappingComplete(mapping, shouldSave ? saveMappingName : null);
  };

  const requiredFields = ['dateColumn', 'descriptionColumn', 'amountColumn'];
  const isValid = requiredFields.every(field => mapping[field]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            🗺️ Mapear Colunas do CSV
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione qual coluna corresponde a cada campo
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Info sobre colunas detectadas */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Colunas encontradas:</strong> {headers.join(', ')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Data - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.dateColumn}
            onChange={e => setMapping({ ...mapping, dateColumn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione a coluna...</option>
            {headers.map(header => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formatos aceitos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
          </p>
        </div>

        {/* Descrição - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.descriptionColumn}
            onChange={e => setMapping({ ...mapping, descriptionColumn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione a coluna...</option>
            {headers.map(header => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nome, memo ou histórico da transação
          </p>
        </div>

        {/* Valor - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valor <span className="text-red-500">*</span>
          </label>
          <select
            value={mapping.amountColumn}
            onChange={e => setMapping({ ...mapping, amountColumn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione a coluna...</option>
            {headers.map(header => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formatos aceitos: R$ 1.234,56 ou 1234.56
          </p>
        </div>

        {/* Categoria - Opcional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            value={mapping.categoryColumn}
            onChange={e => setMapping({ ...mapping, categoryColumn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Nenhuma (será categorizado como "Outros")</option>
            {headers.map(header => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opção de salvar mapeamento */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={shouldSave}
            onChange={e => setShouldSave(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Salvar este mapeamento para uso futuro
          </span>
        </label>

        {shouldSave && (
          <input
            type="text"
            placeholder="Nome do mapeamento (ex: Banco XYZ)"
            value={saveMappingName}
            onChange={e => setSaveMappingName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid}>
          {isValid ? 'Aplicar Mapeamento' : 'Preencha os campos obrigatórios'}
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;
