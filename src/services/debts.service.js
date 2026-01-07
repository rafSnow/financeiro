import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Cria uma nova dívida
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da dívida
 * @returns {Promise<object>} Dívida criada com ID
 */
export const createDebt = async (userId, data) => {
  try {
    const debtData = {
      userId,
      ...data,
      totalAmount: Number(data.totalAmount),
      remainingAmount: Number(data.remainingAmount || data.totalAmount),
      installmentValue: Number(data.installmentValue),
      totalInstallments: Number(data.totalInstallments),
      paidInstallments: Number(data.paidInstallments || 0),
      interestRate: Number(data.interestRate || 0),
      dueDay: Number(data.dueDay),
      priority: Number(data.priority || 999),
      status: data.status || 'active',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'debts'), debtData);

    return {
      id: docRef.id,
      ...debtData,
    };
  } catch (error) {
    console.error('Erro ao criar dívida:', error);
    throw error;
  }
};

/**
 * Busca dívidas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de dívidas
 */
export const getDebts = async userId => {
  try {
    const q = query(
      collection(db, 'debts'),
      where('userId', '==', userId),
      orderBy('priority', 'asc'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const debts = [];

    querySnapshot.forEach(doc => {
      debts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return debts;
  } catch (error) {
    console.error('Erro ao buscar dívidas:', error);
    throw error;
  }
};

/**
 * Atualiza uma dívida
 * @param {string} id - ID da dívida
 * @param {object} data - Dados atualizados
 * @returns {Promise<void>}
 */
export const updateDebt = async (id, data) => {
  try {
    const debtRef = doc(db, 'debts', id);
    const updateData = {
      ...data,
      totalAmount: Number(data.totalAmount),
      remainingAmount: Number(data.remainingAmount),
      installmentValue: Number(data.installmentValue),
      totalInstallments: Number(data.totalInstallments),
      paidInstallments: Number(data.paidInstallments),
      interestRate: Number(data.interestRate || 0),
      dueDay: Number(data.dueDay),
      priority: Number(data.priority || 999),
    };

    await updateDoc(debtRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar dívida:', error);
    throw error;
  }
};

/**
 * Exclui uma dívida
 * @param {string} id - ID da dívida
 * @returns {Promise<void>}
 */
export const deleteDebt = async id => {
  try {
    const debtRef = doc(db, 'debts', id);
    await deleteDoc(debtRef);
  } catch (error) {
    console.error('Erro ao excluir dívida:', error);
    throw error;
  }
};

/**
 * Registra um pagamento de dívida
 * @param {string} debtId - ID da dívida
 * @param {number} amount - Valor do pagamento
 * @returns {Promise<void>}
 */
export const registerPayment = async (debtId, amount) => {
  try {
    const debtRef = doc(db, 'debts', debtId);

    // Buscar dados atuais da dívida
    const debtSnapshot = await getDocs(
      query(collection(db, 'debts'), where('__name__', '==', debtId))
    );

    if (debtSnapshot.empty) {
      throw new Error('Dívida não encontrada');
    }

    const debtData = debtSnapshot.docs[0].data();
    const newRemainingAmount = debtData.remainingAmount - amount;
    const newPaidInstallments = debtData.paidInstallments + 1;

    // Verificar se a dívida foi quitada
    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'active';

    await updateDoc(debtRef, {
      remainingAmount: Math.max(0, newRemainingAmount),
      paidInstallments: newPaidInstallments,
      status: newStatus,
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
};
