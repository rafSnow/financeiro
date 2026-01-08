import PropTypes from 'prop-types';
import { getMethodDescription } from '../utils/debtCalculations';

/**
 * Componente para selecionar método de priorização de dívidas
 */
const DebtMethodSelector = ({ selectedMethod, onMethodChange }) => {
  const snowball = getMethodDescription('snowball');
  const avalanche = getMethodDescription('avalanche');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Método de Priorização</h3>

      <div className="space-y-4">
        {/* Método Bola de Neve */}
        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMethod === 'snowball'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="debtMethod"
            value="snowball"
            checked={selectedMethod === 'snowball'}
            onChange={e => onMethodChange(e.target.value)}
            className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{snowball.icon}</span>
              <h4 className="font-semibold text-gray-900">{snowball.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{snowball.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              ✓ Melhor para: Ganhar motivação com vitórias rápidas
            </div>
          </div>
        </label>

        {/* Método Avalanche */}
        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMethod === 'avalanche'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="debtMethod"
            value="avalanche"
            checked={selectedMethod === 'avalanche'}
            onChange={e => onMethodChange(e.target.value)}
            className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{avalanche.icon}</span>
              <h4 className="font-semibold text-gray-900">{avalanche.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{avalanche.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              ✓ Melhor para: Economizar mais dinheiro em juros
            </div>
          </div>
        </label>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Dica:</strong> Ambos os métodos funcionam! Escolha o que mais combina com seu
          perfil. O importante é manter a disciplina.
        </p>
      </div>
    </div>
  );
};

DebtMethodSelector.propTypes = {
  selectedMethod: PropTypes.oneOf(['snowball', 'avalanche']).isRequired,
  onMethodChange: PropTypes.func.isRequired,
};

export default DebtMethodSelector;
