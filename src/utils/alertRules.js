import { createAlert } from '../services/alerts.service';
import { getDebts } from '../services/debts.service';
import { getExpenses } from '../services/expenses.service';
import { getGoals } from '../services/goals.service';
import { getIncomes } from '../services/income.service';

/**
 * Regra 1: Verifica gastos acima de 80% da renda
 * @param {string} userId - ID do usuário
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 */
export const checkOverspending = async (userId, month, year) => {
  try {
    const incomes = await getIncomes(userId, month, year);
    const expenses = await getExpenses(userId, month, year);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (totalIncome === 0) return null;

    const percentage = (totalExpenses / totalIncome) * 100;

    // Criar alerta se gastou 80% ou mais
    if (percentage >= 80) {
      return await createAlert({
        userId,
        type: 'overspending',
        title: percentage >= 100 ? '🚨 Gastos Acima da Renda!' : '⚠️ Atenção: Gastos Altos',
        message: `Você gastou ${percentage.toFixed(
          0
        )}% da sua renda este mês (R$ ${totalExpenses.toFixed(2)} de R$ ${totalIncome.toFixed(2)})`,
        severity: percentage >= 100 ? 'error' : 'warning',
        data: {
          income: totalIncome,
          expenses: totalExpenses,
          percentage: percentage.toFixed(2),
          month,
          year,
        },
      });
    }

    return null;
  } catch (error) {
    console.error('Erro ao verificar gastos excessivos:', error);
    return null;
  }
};

/**
 * Regra 2: Verifica dívidas vencendo (hoje ou amanhã)
 * @param {string} userId - ID do usuário
 */
export const checkDebtDue = async userId => {
  try {
    const debts = await getDebts(userId);
    const activeDebts = debts.filter(d => d.status === 'active');

    const today = new Date().getDate();
    const alerts = [];

    for (const debt of activeDebts) {
      if (!debt.dueDay) continue;

      const daysUntilDue = debt.dueDay - today;

      // Vence hoje
      if (daysUntilDue === 0) {
        alerts.push(
          await createAlert({
            userId,
            type: 'debt_due',
            title: '📅 Vencimento Hoje!',
            message: `${debt.name} vence hoje: R$ ${debt.installmentValue.toFixed(2)}`,
            severity: 'warning',
            data: {
              debtId: debt.id,
              debtName: debt.name,
              amount: debt.installmentValue,
              dueDay: debt.dueDay,
            },
          })
        );
      }
      // Vence amanhã
      else if (daysUntilDue === 1 || (today === 31 && debt.dueDay === 1)) {
        alerts.push(
          await createAlert({
            userId,
            type: 'debt_due',
            title: '📅 Vencimento Amanhã',
            message: `${debt.name} vence amanhã: R$ ${debt.installmentValue.toFixed(2)}`,
            severity: 'warning',
            data: {
              debtId: debt.id,
              debtName: debt.name,
              amount: debt.installmentValue,
              dueDay: debt.dueDay,
            },
          })
        );
      }
      // Venceu (passou do dia)
      else if (daysUntilDue < 0 && Math.abs(daysUntilDue) <= 5) {
        alerts.push(
          await createAlert({
            userId,
            type: 'debt_overdue',
            title: '🚨 Pagamento Atrasado!',
            message: `${debt.name} venceu há ${Math.abs(
              daysUntilDue
            )} dia(s): R$ ${debt.installmentValue.toFixed(2)}`,
            severity: 'error',
            data: {
              debtId: debt.id,
              debtName: debt.name,
              amount: debt.installmentValue,
              dueDay: debt.dueDay,
              daysOverdue: Math.abs(daysUntilDue),
            },
          })
        );
      }
    }

    return alerts;
  } catch (error) {
    console.error('Erro ao verificar vencimentos:', error);
    return [];
  }
};

/**
 * Regra 3: Verifica metas alcançadas
 * @param {string} userId - ID do usuário
 */
export const checkGoalReached = async userId => {
  try {
    const goals = await getGoals(userId);
    const alerts = [];

    for (const goal of goals) {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;

      // Meta alcançada mas não marcada como completa
      if (percentage >= 100 && goal.status === 'active') {
        alerts.push(
          await createAlert({
            userId,
            type: 'goal_reached',
            title: '🎉 Meta Alcançada!',
            message: `Parabéns! Você completou: ${goal.name}`,
            severity: 'success',
            data: {
              goalId: goal.id,
              goalName: goal.name,
              targetAmount: goal.targetAmount,
              currentAmount: goal.currentAmount,
            },
          })
        );
      }
      // Meta próxima de ser alcançada (90-99%)
      else if (percentage >= 90 && percentage < 100 && goal.status === 'active') {
        alerts.push(
          await createAlert({
            userId,
            type: 'goal_near',
            title: '🎯 Meta Quase Completa!',
            message: `Faltam apenas ${(100 - percentage).toFixed(0)}% para completar: ${goal.name}`,
            severity: 'info',
            data: {
              goalId: goal.id,
              goalName: goal.name,
              percentage: percentage.toFixed(2),
              remaining: (goal.targetAmount - goal.currentAmount).toFixed(2),
            },
          })
        );
      }
    }

    return alerts;
  } catch (error) {
    console.error('Erro ao verificar metas:', error);
    return [];
  }
};

/**
 * Regra 4: Verifica juros altos em dívidas
 * @param {string} userId - ID do usuário
 */
export const checkHighInterest = async userId => {
  try {
    const debts = await getDebts(userId);
    const activeDebts = debts.filter(d => d.status === 'active');

    const alerts = [];

    for (const debt of activeDebts) {
      // Juros acima de 10% ao mês = muito alto
      if (debt.interestRate >= 10) {
        alerts.push(
          await createAlert({
            userId,
            type: 'high_interest',
            title: '💸 Alerta: Juros Muito Altos!',
            message: `${debt.name} tem juros de ${debt.interestRate}% ao mês. Considere renegociar ou priorizar o pagamento.`,
            severity: 'error',
            data: {
              debtId: debt.id,
              debtName: debt.name,
              interestRate: debt.interestRate,
              monthlyInterest: ((debt.remainingAmount * debt.interestRate) / 100).toFixed(2),
            },
          })
        );
      }
      // Juros entre 5% e 10% = alto
      else if (debt.interestRate >= 5) {
        alerts.push(
          await createAlert({
            userId,
            type: 'high_interest',
            title: '⚠️ Atenção: Juros Elevados',
            message: `${debt.name} tem juros de ${debt.interestRate}% ao mês. Avalie priorizar este pagamento.`,
            severity: 'warning',
            data: {
              debtId: debt.id,
              debtName: debt.name,
              interestRate: debt.interestRate,
              monthlyInterest: ((debt.remainingAmount * debt.interestRate) / 100).toFixed(2),
            },
          })
        );
      }
    }

    return alerts;
  } catch (error) {
    console.error('Erro ao verificar juros altos:', error);
    return [];
  }
};

/**
 * Executa todas as verificações de alertas
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de alertas criados
 */
export const runAllChecks = async userId => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const results = await Promise.all([
      checkOverspending(userId, month, year),
      checkDebtDue(userId),
      checkGoalReached(userId),
      checkHighInterest(userId),
    ]);

    // Flatten arrays e remove nulls
    return results.flat().filter(Boolean);
  } catch (error) {
    console.error('Erro ao executar verificações:', error);
    return [];
  }
};
