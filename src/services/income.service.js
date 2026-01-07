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
 * Cria uma nova renda
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da renda
 * @returns {Promise<object>} Renda criada com ID
 */
export const createIncome = async (userId, data) => {
  try {
    const incomeData = {
      userId,
      ...data,
      amount: Number(data.amount),
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : Timestamp.now(),
      received: data.received || false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'incomes'), incomeData);

    return {
      id: docRef.id,
      ...incomeData,
    };
  } catch (error) {
    console.error('Erro ao criar renda:', error);
    throw error;
  }
};

/**
 * Busca rendas de um usuário em um mês específico
 * @param {string} userId - ID do usuário
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Promise<Array>} Lista de rendas
 */
export const getIncomes = async (userId, month, year) => {
  try {
    // Criar data de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const incomes = [];

    querySnapshot.forEach(doc => {
      incomes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return incomes;
  } catch (error) {
    console.error('Erro ao buscar rendas:', error);
    throw error;
  }
};

/**
 * Atualiza uma renda
 * @param {string} id - ID da renda
 * @param {object} data - Dados atualizados
 * @returns {Promise<void>}
 */
export const updateIncome = async (id, data) => {
  try {
    const incomeRef = doc(db, 'incomes', id);
    const updateData = {
      ...data,
      amount: Number(data.amount),
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : data.date,
    };

    await updateDoc(incomeRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar renda:', error);
    throw error;
  }
};

/**
 * Exclui uma renda
 * @param {string} id - ID da renda
 * @returns {Promise<void>}
 */
export const deleteIncome = async id => {
  try {
    const incomeRef = doc(db, 'incomes', id);
    await deleteDoc(incomeRef);
  } catch (error) {
    console.error('Erro ao excluir renda:', error);
    throw error;
  }
};

/**
 * Busca todas as rendas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as rendas
 */
export const getAllIncomes = async userId => {
  try {
    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const incomes = [];

    querySnapshot.forEach(doc => {
      incomes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return incomes;
  } catch (error) {
    console.error('Erro ao buscar todas as rendas:', error);
    throw error;
  }
};
