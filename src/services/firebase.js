import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Messaging (apenas se suportado pelo navegador)
let messaging = null;
try {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging não suportado neste ambiente:', error);
}

export { messaging };

/**
 * Requisita permissão para notificações push
 * @returns {Promise<string|null>} Token FCM ou null se não autorizado
 */
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging não está disponível');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      return token;
    }

    return null;
  } catch (error) {
    console.error('Erro ao requisitar permissão de notificação:', error);
    return null;
  }
};

/**
 * Escuta mensagens em primeiro plano
 * @param {function} callback - Função chamada quando receber mensagem
 * @returns {function} Unsubscribe function
 */
export const listenToForegroundMessages = callback => {
  if (!messaging) {
    console.warn('Firebase Messaging não está disponível');
    return () => {};
  }

  return onMessage(messaging, payload => {
    callback(payload);
  });
};

export default app;
