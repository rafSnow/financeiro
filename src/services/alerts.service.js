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
 * Cria um novo alerta
 * @param {object} data - Dados do alerta
 * @returns {Promise<object>} Alerta criado com ID
 */
export const createAlert = async data => {
  try {
    const alertData = {
      ...data,
      isRead: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'alerts'), alertData);

    return {
      id: docRef.id,
      ...alertData,
    };
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    throw error;
  }
};

/**
 * Busca alertas de um usuário
 * @param {string} userId - ID do usuário
 * @param {boolean} unreadOnly - Se true, retorna apenas não lidos
 * @returns {Promise<Array>} Lista de alertas
 */
export const getAlerts = async (userId, unreadOnly = false) => {
  try {
    let q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'alerts'),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const alerts = [];

    querySnapshot.forEach(doc => {
      alerts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return alerts;
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    throw error;
  }
};

/**
 * Marca alerta como lido
 * @param {string} alertId - ID do alerta
 * @returns {Promise<void>}
 */
export const markAsRead = async alertId => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      isRead: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao marcar alerta como lido:', error);
    throw error;
  }
};

/**
 * Marca todos os alertas como lidos
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
export const markAllAsRead = async userId => {
  try {
    const alerts = await getAlerts(userId, true);
    const promises = alerts.map(alert => markAsRead(alert.id));
    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao marcar todos como lidos:', error);
    throw error;
  }
};

/**
 * Deleta um alerta
 * @param {string} alertId - ID do alerta
 * @returns {Promise<void>}
 */
export const deleteAlert = async alertId => {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    throw error;
  }
};

/**
 * Deleta todos os alertas lidos
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
export const deleteReadAlerts = async userId => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('isRead', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const promises = [];

    querySnapshot.forEach(doc => {
      promises.push(deleteDoc(doc.ref));
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao deletar alertas lidos:', error);
    throw error;
  }
};

/**
 * Retorna contagem de alertas não lidos
 * @param {string} userId - ID do usuário
 * @returns {Promise<number>} Contagem de não lidos
 */
export const getUnreadCount = async userId => {
  try {
    const alerts = await getAlerts(userId, true);
    return alerts.length;
  } catch (error) {
    console.error('Erro ao buscar contagem de não lidos:', error);
    return 0;
  }
};
