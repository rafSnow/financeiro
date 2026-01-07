import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {string} name - Nome do usuário
 * @param {number} salary - Salário mensal do usuário
 * @returns {Promise<object>} Dados do usuário criado
 */
export const register = async (email, password, name, salary) => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar perfil com nome
    await updateProfile(user, {
      displayName: name,
    });

    // Criar documento do usuário no Firestore
    const userData = {
      name,
      email,
      salary: Number(salary),
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      ...userData,
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<object>} Dados do usuário
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Buscar dados adicionais do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      ...userData,
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Faz logout do usuário
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Envia email de recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<void>}
 */
export const resetPassword = async email => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    throw error;
  }
};

/**
 * Retorna mensagem de erro amigável baseada no código de erro do Firebase
 * @param {string} errorCode - Código de erro do Firebase
 * @returns {string} Mensagem de erro amigável
 */
export const getAuthErrorMessage = errorCode => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email já está cadastrado.',
    'auth/invalid-email': 'Email inválido.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-disabled': 'Este usuário foi desabilitado.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  };

  return errorMessages[errorCode] || 'Erro ao processar solicitação. Tente novamente.';
};
