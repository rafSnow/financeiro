import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Cria uma nova despesa
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da despesa
 * @returns {Promise<object>} Despesa criada com ID
 */
export const createExpense = async (userId, data) => {
  try {
    const expenseData = {
      userId,
      ...data,
      amount: Number(data.amount),
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);

    return {
      id: docRef.id,
      ...expenseData,
    };
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    throw error;
  }
};

/**
 * Busca despesas de um usuário em um mês específico
 * @param {string} userId - ID do usuário
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Promise<Array>} Lista de despesas
 */
export const getExpenses = async (userId, month, year) => {
  try {
    // Criar data de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];

    querySnapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return expenses;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    throw error;
  }
};

/**
 * Atualiza uma despesa
 * @param {string} id - ID da despesa
 * @param {object} data - Dados para atualizar
 * @returns {Promise<void>}
 */
export const updateExpense = async (id, data) => {
  try {
    const expenseRef = doc(db, 'expenses', id);
    const updateData = {
      ...data,
      amount: data.amount ? Number(data.amount) : undefined,
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : undefined,
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(expenseRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
};

/**
 * Exclui uma despesa
 * @param {string} id - ID da despesa
 * @returns {Promise<void>}
 */
export const deleteExpense = async id => {
  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    throw error;
  }
};

/**
 * Busca todas as despesas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as despesas
 */
export const getAllExpenses = async userId => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];

    querySnapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return expenses;
  } catch (error) {
    console.error('Erro ao buscar todas as despesas:', error);
    throw error;
  }
};

/**
 * Busca despesas de forma paginada
 * @param {string} userId - ID do usuário
 * @param {object} lastDoc - Último documento da página anterior (para paginação)
 * @param {number} limitCount - Número de documentos por página (padrão: 20)
 * @returns {Promise<object>} Objeto com expenses e lastDoc para próxima página
 */
export const getExpensesPaginated = async (userId, lastDoc = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      expenses,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limitCount,
    };
  } catch (error) {
    console.error('Erro ao buscar despesas paginadas:', error);
    throw error;
  }
};
