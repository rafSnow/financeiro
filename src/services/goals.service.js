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
 * Cria uma nova meta
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da meta
 * @returns {Promise<object>} Meta criada com ID
 */
export const createGoal = async (userId, data) => {
  try {
    const goalData = {
      userId,
      name: data.name,
      description: data.description || '',
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount || 0),
      deadline: data.deadline,
      category: data.category || 'savings',
      priority: Number(data.priority || 1),
      status: 'active',
      createdAt: Timestamp.now(),
      completedAt: null,
    };

    const docRef = await addDoc(collection(db, 'goals'), goalData);

    return {
      id: docRef.id,
      ...goalData,
    };
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    throw error;
  }
};

/**
 * Busca todas as metas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Array de metas
 */
export const getGoals = async userId => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('priority', 'asc'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const goals = [];

    querySnapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return goals;
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    throw error;
  }
};

/**
 * Atualiza uma meta
 * @param {string} goalId - ID da meta
 * @param {object} data - Dados a atualizar
 * @returns {Promise<void>}
 */
export const updateGoal = async (goalId, data) => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, data);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    throw error;
  }
};

/**
 * Atualiza o progresso de uma meta
 * @param {string} goalId - ID da meta
 * @param {number} amount - Valor a adicionar
 * @returns {Promise<void>}
 */
export const updateGoalProgress = async (goalId, amount) => {
  try {
    const goalRef = doc(db, 'goals', goalId);

    // Buscar meta atual
    const goalDoc = await getDocs(query(collection(db, 'goals'), where('__name__', '==', goalId)));
    const goal = goalDoc.docs[0]?.data();

    if (!goal) throw new Error('Meta não encontrada');

    const newAmount = (goal.currentAmount || 0) + Number(amount);
    const isCompleted = newAmount >= goal.targetAmount;

    await updateDoc(goalRef, {
      currentAmount: newAmount,
      ...(isCompleted && {
        status: 'completed',
        completedAt: Timestamp.now(),
      }),
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso da meta:', error);
    throw error;
  }
};

/**
 * Marca uma meta como concluída
 * @param {string} goalId - ID da meta
 * @returns {Promise<void>}
 */
export const completeGoal = async goalId => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      status: 'completed',
      completedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao concluir meta:', error);
    throw error;
  }
};

/**
 * Pausa uma meta
 * @param {string} goalId - ID da meta
 * @returns {Promise<void>}
 */
export const pauseGoal = async goalId => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      status: 'paused',
    });
  } catch (error) {
    console.error('Erro ao pausar meta:', error);
    throw error;
  }
};

/**
 * Reativa uma meta pausada
 * @param {string} goalId - ID da meta
 * @returns {Promise<void>}
 */
export const resumeGoal = async goalId => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      status: 'active',
    });
  } catch (error) {
    console.error('Erro ao reativar meta:', error);
    throw error;
  }
};

/**
 * Deleta uma meta
 * @param {string} goalId - ID da meta
 * @returns {Promise<void>}
 */
export const deleteGoal = async goalId => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    throw error;
  }
};

/**
 * Busca meta por categoria
 * @param {string} userId - ID do usuário
 * @param {string} category - Categoria da meta
 * @returns {Promise<object|null>} Meta encontrada ou null
 */
export const getGoalByCategory = async (userId, category) => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('category', '==', category),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Erro ao buscar meta por categoria:', error);
    throw error;
  }
};
