import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../utils/constants';
import { calculatePayoffDate, simulateDebtPayoff } from '../utils/simulator';
import AmortizationTable from './AmortizationTable';

/**
 * Componente simulador de quitação de dívidas
 * Permite simular quanto tempo leva para quitar com pagamento extra
 * @param {Object} props
 * @param {object} props.debt - Objeto da dívida a simular
 * @param {function} props.onClose - Função para fechar o simulador (opcional)
 */
const DebtSimulator = ({ debt, onClose }) => {
  const [extraPayment, setExtraPayment] = useState(0);

  // Calcular simulações usando useMemo para evitar recálculos desnecessários
  const currentScenario = useMemo(() => simulateDebtPayoff(debt, 0), [debt]);

  const simulatedScenario = useMemo(
    () => simulateDebtPayoff(debt, extraPayment),
    [debt, extraPayment]
  );

  // Calcular economia
  const savings = {
    interest: currentScenario.totalInterest - simulatedScenario.totalInterest,
    months: currentScenario.months - simulatedScenario.months,
    total: currentScenario.totalPaid - simulatedScenario.totalPaid,
  };

  // Calcular data de quitação
  const currentPayoffDate = calculatePayoffDate(currentScenario.months);
  const simulatedPayoffDate = calculatePayoffDate(simulatedScenario.months);

  // Formatar datas
  const formatDate = date => {
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Calcular porcentagem de economia
  const savingsPercentage = ((savings.interest / currentScenario.totalInterest) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">📊 Simulador de Quitação</h3>
            <p className="text-blue-100 text-sm">{debt.name}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Informações da dívida */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Saldo Devedor</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(debt.remainingAmount)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Parcela Mensal</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(debt.installmentValue)}
            </p>
          </div>
        </div>

        {/* Slider de pagamento extra */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">💰 Pagamento Extra Mensal</label>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(extraPayment)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={extraPayment}
            onChange={e => setExtraPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>R$ 0</span>
            <span>R$ 500</span>
            <span>R$ 1.000</span>
          </div>

          {/* Botões rápidos */}
          <div className="flex gap-2 mt-3">
            {[0, 100, 200, 500].map(value => (
              <button
                key={value}
                onClick={() => setExtraPayment(value)}
                className={`flex-1 px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                  extraPayment === value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value === 0 ? 'Nenhum' : formatCurrency(value)}
              </button>
            ))}
          </div>
        </div>

        {/* Comparação de cenários */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cenário atual (sem extra) */}
          <div className="border-2 border-gray-200 rounded-xl p-4">
            <div className="text-center mb-3">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                Sem Pagamento Extra
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Tempo de quitação</p>
                <p className="text-xl font-bold text-gray-900">{currentScenario.months} meses</p>
                <p className="text-xs text-gray-500">{formatDate(currentPayoffDate)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Total de juros</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(currentScenario.totalInterest)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Total a pagar</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatCurrency(currentScenario.totalPaid)}
                </p>
              </div>
            </div>
          </div>

          {/* Cenário com extra */}
          <div
            className={`border-2 rounded-xl p-4 ${
              extraPayment > 0 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-center mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  extraPayment > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                Com {formatCurrency(extraPayment)}/mês
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Tempo de quitação</p>
                <p className="text-xl font-bold text-gray-900">{simulatedScenario.months} meses</p>
                <p className="text-xs text-gray-500">{formatDate(simulatedPayoffDate)}</p>
                {extraPayment > 0 && savings.months > 0 && (
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    ⚡ {savings.months} meses mais rápido!
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Total de juros</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(simulatedScenario.totalInterest)}
                </p>
                {extraPayment > 0 && savings.interest > 0 && (
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    💰 Economia: {formatCurrency(savings.interest)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Total a pagar</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatCurrency(simulatedScenario.totalPaid)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo da economia */}
        {extraPayment > 0 && (
          <div className="bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Resumo da Economia</span>
            </h4>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Juros Economizados</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(savings.interest)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{savingsPercentage}% menos</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Tempo Economizado</p>
                <p className="text-lg font-bold text-blue-600">
                  {savings.months} {savings.months === 1 ? 'mês' : 'meses'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((savings.months / currentScenario.months) * 100).toFixed(0)}% mais rápido
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Economia Total</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(savings.total)}</p>
                <p className="text-xs text-gray-500 mt-1">Valor total</p>
              </div>
            </div>

            {/* Dica motivacional */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-gray-700 text-center">
                💡 <span className="font-semibold">Dica:</span> Pagando apenas{' '}
                <span className="font-bold text-green-700">{formatCurrency(extraPayment)}</span> a
                mais por mês, você economiza{' '}
                <span className="font-bold text-green-700">{formatCurrency(savings.interest)}</span>{' '}
                em juros e quita sua dívida{' '}
                <span className="font-bold text-green-700">{savings.months} meses</span> antes!
              </p>
            </div>
          </div>
        )}

        {/* Gráfico de Evolução da Dívida */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>Evolução do Saldo Devedor</span>
          </h4>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={simulatedScenario.history}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                label={{ value: 'Mês', position: 'insideBottom', offset: -5 }}
                stroke="#666"
              />
              <YAxis tickFormatter={value => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#666" />
              <Tooltip
                formatter={(value, name) => {
                  const names = {
                    remaining: 'Saldo Restante',
                  };
                  return [formatCurrency(value), names[name] || name];
                }}
                labelFormatter={label => `Mês ${label}`}
              />
              <Legend
                formatter={value => {
                  const names = {
                    remaining: 'Saldo Restante',
                  };
                  return names[value] || value;
                }}
              />
              <Line
                type="monotone"
                dataKey="remaining"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="remaining"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Juros vs Principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span>
            <span>Composição dos Pagamentos (Juros vs Principal)</span>
          </h4>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={simulatedScenario.history}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                label={{ value: 'Mês', position: 'insideBottom', offset: -5 }}
                stroke="#666"
              />
              <YAxis tickFormatter={value => `R$ ${value.toFixed(0)}`} stroke="#666" />
              <Tooltip
                formatter={(value, name) => {
                  const names = {
                    interest: 'Juros',
                    principal: 'Principal (Amortização)',
                  };
                  return [formatCurrency(value), names[name] || name];
                }}
                labelFormatter={label => `Mês ${label}`}
              />
              <Legend
                formatter={value => {
                  const names = {
                    interest: 'Juros',
                    principal: 'Principal (Amortização)',
                  };
                  return names[value] || value;
                }}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="interest"
              />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="principal"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Juros: vai para o banco</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Principal: reduz sua dívida</span>
            </div>
          </div>
        </div>

        {/* Tabela de Amortização */}
        <AmortizationTable history={simulatedScenario.history} maxRows={12} />
      </div>
    </div>
  );
};

DebtSimulator.propTypes = {
  debt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    remainingAmount: PropTypes.number.isRequired,
    installmentValue: PropTypes.number.isRequired,
    interestRate: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

export default DebtSimulator;
