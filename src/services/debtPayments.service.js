import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { updateDebt } from './debts.service';
import { db } from './firebase';

/**
 * Registra um pagamento de dívida
 * @param {string} userId - ID do usuário
 * @param {string} debtId - ID da dívida
 * @param {number} amount - Valor do pagamento
 * @param {boolean} isExtra - Se é um pagamento extra (além da parcela mensal)
 * @param {string} notes - Observações sobre o pagamento
 * @returns {Promise<object>} Pagamento criado com ID
 */
export const registerPayment = async (userId, debtId, amount, isExtra = false, notes = '') => {
  try {
    const paymentData = {
      userId,
      debtId,
      amount: Number(amount),
      isExtra,
      notes,
      date: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'debt_payments'), paymentData);

    return {
      id: docRef.id,
      ...paymentData,
    };
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
};

/**
 * Busca histórico de pagamentos de uma dívida
 * @param {string} debtId - ID da dívida
 * @returns {Promise<Array>} Lista de pagamentos ordenados por data
 */
export const getPaymentHistory = async debtId => {
  try {
    const q = query(
      collection(db, 'debt_payments'),
      where('debtId', '==', debtId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const payments = [];

    querySnapshot.forEach(doc => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return payments;
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    throw error;
  }
};

/**
 * Processa um pagamento: registra o pagamento e atualiza a dívida
 * @param {string} userId - ID do usuário
 * @param {object} debt - Objeto da dívida
 * @param {number} amount - Valor do pagamento
 * @param {boolean} isExtra - Se é um pagamento extra
 * @param {string} notes - Observações
 * @returns {Promise<object>} Resultado do processamento com dados atualizados
 */
export const processPayment = async (userId, debt, amount, isExtra = false, notes = '') => {
  try {
    // 1. Registrar pagamento
    const payment = await registerPayment(userId, debt.id, amount, isExtra, notes);

    // 2. Calcular novos valores
    const newRemainingAmount = Math.max(0, debt.remainingAmount - amount);
    const newPaidInstallments = isExtra ? debt.paidInstallments : debt.paidInstallments + 1;
    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'active';

    // 3. Atualizar dívida
    await updateDebt(debt.id, {
      ...debt,
      remainingAmount: newRemainingAmount,
      paidInstallments: newPaidInstallments,
      status: newStatus,
    });

    return {
      payment,
      updatedDebt: {
        ...debt,
        remainingAmount: newRemainingAmount,
        paidInstallments: newPaidInstallments,
        status: newStatus,
      },
      wasPaidOff: newStatus === 'paid',
    };
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
};
