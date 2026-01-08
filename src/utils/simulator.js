/**
 * Simulador de quitação de dívidas
 * Calcula projeções de pagamento com diferentes cenários
 */

/**
 * Simula quanto tempo leva para quitar uma dívida com pagamento extra
 * @param {object} debt - Objeto da dívida
 * @param {number} extraPayment - Valor extra mensal (além da parcela normal)
 * @returns {object} Resultado da simulação com meses, juros total, histórico
 */
export const simulateDebtPayoff = (debt, extraPayment = 0) => {
  let remaining = debt.remainingAmount;
  let months = 0;
  let totalInterest = 0;
  const monthlyPayment = debt.installmentValue + extraPayment;
  
  // Taxa de juros mensal (convertendo taxa anual para mensal)
  const monthlyInterestRate = debt.interestRate / 12 / 100;

  const history = [];

  // Simular até quitar ou atingir 360 meses (30 anos)
  while (remaining > 0 && months < 360) {
    months++;
    
    // Calcular juros do mês sobre o saldo restante
    const monthlyInterestAmount = remaining * monthlyInterestRate;
    totalInterest += monthlyInterestAmount;

    // Calcular quanto vai para o principal (amortização)
    const principalPayment = monthlyPayment - monthlyInterestAmount;
    
    // Atualizar saldo restante
    remaining -= principalPayment;

    // Registrar histórico do mês
    history.push({
      month: months,
      payment: monthlyPayment,
      interest: monthlyInterestAmount,
      principal: principalPayment,
      remaining: Math.max(0, remaining),
    });

    // Se o saldo restante for menor que o pagamento, quita no próximo mês
    if (remaining > 0 && remaining < monthlyPayment) {
      // Último pagamento será apenas o restante + juros do próximo mês
      months++;
      const lastInterest = remaining * monthlyInterestRate;
      totalInterest += lastInterest;
      
      history.push({
        month: months,
        payment: remaining + lastInterest,
        interest: lastInterest,
        principal: remaining,
        remaining: 0,
      });
      
      remaining = 0;
    }
  }

  return {
    months,
    totalInterest,
    totalPaid: debt.remainingAmount + totalInterest,
    history,
    extraPayment,
  };
};

/**
 * Compara múltiplos cenários de pagamento
 * @param {object} debt - Objeto da dívida
 * @param {Array<number>} scenarios - Array com valores extras a simular
 * @returns {Array<object>} Array com resultado de cada cenário
 */
export const compareScenarios = (debt, scenarios = [0, 100, 200, 500]) => {
  return scenarios.map(extra => {
    const result = simulateDebtPayoff(debt, extra);
    return {
      extraPayment: extra,
      months: result.months,
      totalInterest: result.totalInterest,
      totalPaid: result.totalPaid,
      savings: scenarios[0] === extra ? 0 : simulateDebtPayoff(debt, scenarios[0]).totalInterest - result.totalInterest,
      monthsSaved: scenarios[0] === extra ? 0 : simulateDebtPayoff(debt, scenarios[0]).months - result.months,
    };
  });
};

/**
 * Calcula a economia de juros comparando dois cenários
 * @param {object} debt - Objeto da dívida
 * @param {number} currentExtra - Valor extra atual
 * @param {number} newExtra - Novo valor extra a comparar
 * @returns {object} Diferença em juros e meses
 */
export const calculateSavings = (debt, currentExtra = 0, newExtra = 0) => {
  const currentScenario = simulateDebtPayoff(debt, currentExtra);
  const newScenario = simulateDebtPayoff(debt, newExtra);

  return {
    interestSavings: currentScenario.totalInterest - newScenario.totalInterest,
    monthsSaved: currentScenario.months - newScenario.months,
    currentMonths: currentScenario.months,
    newMonths: newScenario.months,
    currentTotalInterest: currentScenario.totalInterest,
    newTotalInterest: newScenario.totalInterest,
  };
};

/**
 * Calcula data aproximada de quitação
 * @param {number} months - Número de meses até quitar
 * @returns {Date} Data aproximada de quitação
 */
export const calculatePayoffDate = months => {
  const today = new Date();
  const payoffDate = new Date(today);
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return payoffDate;
};
