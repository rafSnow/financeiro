import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Cria um backup completo dos dados do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} Objeto com dados do backup
 */
export const createBackup = async userId => {
  try {
    const backup = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      userId,
      data: {},
    };

    // Exportar todas as coleções
    const collections = ['expenses', 'incomes', 'debts', 'goals', 'categories'];

    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), where('userId', '==', userId));

      const snapshot = await getDocs(q);
      backup.data[collectionName] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    }

    // Incluir configurações do usuário
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      backup.data.user = userDoc.data();
    }

    return backup;
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    throw error;
  }
};

/**
 * Salva o backup na nuvem (Firestore)
 * @param {string} userId - ID do usuário
 * @param {object} backup - Dados do backup
 * @returns {Promise<void>}
 */
export const saveBackupToCloud = async (userId, backup) => {
  try {
    const backupRef = doc(db, 'backups', `${userId}_${Date.now()}`);
    await setDoc(backupRef, backup);

    // Manter apenas últimos 5 backups
    await cleanOldBackups(userId, 5);
  } catch (error) {
    console.error('Erro ao salvar backup na nuvem:', error);
    throw error;
  }
};

/**
 * Remove backups antigos, mantendo apenas os N mais recentes
 * @param {string} userId - ID do usuário
 * @param {number} keepCount - Quantidade de backups a manter
 * @returns {Promise<void>}
 */
export const cleanOldBackups = async (userId, keepCount = 5) => {
  try {
    const q = query(
      collection(db, 'backups'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const toDelete = snapshot.docs.slice(keepCount);

    if (toDelete.length > 0) {
      const batch = writeBatch(db);
      toDelete.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    }
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
    throw error;
  }
};

/**
 * Baixa o backup como arquivo JSON
 * @param {object} backup - Dados do backup
 * @returns {void}
 */
export const downloadBackup = backup => {
  try {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar backup:', error);
    throw error;
  }
};

/**
 * Restaura dados a partir de um backup
 * @param {string} userId - ID do usuário
 * @param {object} backup - Dados do backup
 * @returns {Promise<void>}
 */
export const restoreBackup = async (userId, backup) => {
  try {
    const collections = ['expenses', 'incomes', 'debts', 'goals', 'categories'];

    for (const collectionName of collections) {
      const items = backup.data[collectionName] || [];

      if (items.length > 0) {
        // Processar em lotes de 500 (limite do Firestore)
        const batchSize = 500;
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = writeBatch(db);
          const batchItems = items.slice(i, i + batchSize);

          batchItems.forEach(item => {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          });

          await batch.commit();
        }
      }
    }

    // Restaurar configurações do usuário
    if (backup.data.user) {
      await setDoc(doc(db, 'users', userId), backup.data.user);
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};

/**
 * Lista backups disponíveis do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limitCount - Limite de backups a retornar
 * @returns {Promise<Array>} Lista de backups
 */
export const getBackups = async (userId, limitCount = 5) => {
  try {
    const q = query(
      collection(db, 'backups'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    throw error;
  }
};
