import { getGoalByCategory, updateGoalProgress } from './goals.service';

/**
 * Sincroniza progresso de meta quando um pagamento de dívida é realizado
 */
export const syncDebtGoalProgress = async (userId, paymentAmount) => {
  try {
    // Busca meta de categoria 'debt' ativa
    const debtGoal = await getGoalByCategory(userId, 'debt');

    if (!debtGoal) {
      // Não há meta de dívida ativa, retorna sem fazer nada
      return null;
    }

    // Atualiza progresso da meta
    await updateGoalProgress(debtGoal.id, paymentAmount);

    return debtGoal;
  } catch (error) {
    console.error('Erro ao sincronizar meta de dívida:', error);
    // Não propaga erro para não interromper fluxo de pagamento
    return null;
  }
};

/**
 * Verifica se meta de dívida foi completada
 */
export const checkDebtGoalCompletion = async (userId, debtGoal, paymentAmount) => {
  const newAmount = debtGoal.currentAmount + paymentAmount;
  return newAmount >= debtGoal.targetAmount;
};
