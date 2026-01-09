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
 * Categorias padrão do sistema
 */
export const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', icon: '🍔', color: '#EF4444', type: 'variable' },
  { name: 'Transporte', icon: '🚗', color: '#F59E0B', type: 'variable' },
  { name: 'Moradia', icon: '🏠', color: '#10B981', type: 'fixed' },
  { name: 'Saúde', icon: '💊', color: '#3B82F6', type: 'variable' },
  { name: 'Educação', icon: '📚', color: '#8B5CF6', type: 'variable' },
  { name: 'Lazer', icon: '🎮', color: '#EC4899', type: 'variable' },
  { name: 'Vestuário', icon: '👕', color: '#6366F1', type: 'variable' },
  { name: 'Serviços', icon: '⚙️', color: '#14B8A6', type: 'variable' },
  { name: 'Outros', icon: '📦', color: '#64748B', type: 'variable' },
];

/**
 * Cria uma nova categoria
 * @param {string} userId - ID do usuário
 * @param {object} data - Dados da categoria
 * @returns {Promise<object>} Categoria criada com ID
 */
export const createCategory = async (userId, data) => {
  try {
    const categoryData = {
      userId,
      name: data.name,
      icon: data.icon || '📦',
      color: data.color || '#64748B',
      budgetLimit: Number(data.budgetLimit || 0),
      type: data.type || 'variable',
      isDefault: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'categories'), categoryData);

    return {
      id: docRef.id,
      ...categoryData,
    };
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

/**
 * Busca todas as categorias de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de categorias
 */
export const getCategories = async userId => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const categories = [];

    querySnapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Se não houver categorias, retornar as padrões (mas não salvar ainda)
    if (categories.length === 0) {
      return DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index}`,
        isDefault: true,
      }));
    }

    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Atualiza uma categoria
 * @param {string} id - ID da categoria
 * @param {object} data - Dados para atualizar
 * @returns {Promise<void>}
 */
export const updateCategory = async (id, data) => {
  try {
    const categoryRef = doc(db, 'categories', id);
    const updateData = {
      ...data,
      budgetLimit: data.budgetLimit ? Number(data.budgetLimit) : undefined,
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

/**
 * Deleta uma categoria
 * @param {string} id - ID da categoria
 * @returns {Promise<void>}
 */
export const deleteCategory = async id => {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};

/**
 * Inicializa categorias padrão para um novo usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Categorias criadas
 */
export const initDefaultCategories = async userId => {
  try {
    const categories = [];

    for (const category of DEFAULT_CATEGORIES) {
      const created = await createCategory(userId, category);
      categories.push(created);
    }

    return categories;
  } catch (error) {
    console.error('Erro ao inicializar categorias padrão:', error);
    throw error;
  }
};

/**
 * Busca uma categoria por nome
 * @param {string} userId - ID do usuário
 * @param {string} name - Nome da categoria
 * @returns {Promise<object|null>} Categoria encontrada ou null
 */
export const getCategoryByName = async (userId, name) => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', userId),
      where('name', '==', name)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Erro ao buscar categoria por nome:', error);
    throw error;
  }
};
