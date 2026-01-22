/**
 * Serviço de gerenciamento de notificações push
 * Lida com subscrição, cancelamento e envio de notificações
 */

import { doc, setDoc } from 'firebase/firestore';
import { db, listenToForegroundMessages, requestNotificationPermission } from './firebase';

/**
 * Subscreve o usuário para receber notificações push
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se subscrito com sucesso
 */
export const subscribeToNotifications = async userId => {
  try {
    const token = await requestNotificationPermission();

    if (token) {
      // Salvar token no Firestore
      await setDoc(
        doc(db, 'users', userId),
        {
          notificationToken: token,
          notificationsEnabled: true,
          lastTokenUpdate: new Date(),
        },
        { merge: true }
      );

      console.log('Inscrito para notificações com token:', token);
      return true;
    }

    console.warn('Permissão de notificação não concedida');
    return false;
  } catch (error) {
    console.error('Erro ao subscrever para notificações:', error);
    return false;
  }
};

/**
 * Cancela subscrição de notificações
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se cancelado com sucesso
 */
export const unsubscribeFromNotifications = async userId => {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        notificationsEnabled: false,
      },
      { merge: true }
    );

    console.log('Notificações desabilitadas para usuário:', userId);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
    return false;
  }
};

/**
 * Verifica se notificações estão disponíveis no navegador
 * @returns {boolean} True se suportado
 */
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Verifica o status da permissão de notificação
 * @returns {string} 'granted', 'denied' ou 'default'
 */
export const getNotificationPermissionStatus = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
};

/**
 * Escuta notificações em primeiro plano e exibe toast
 * @param {function} showToast - Função para mostrar toast
 * @returns {function} Unsubscribe function
 */
export const setupForegroundNotifications = showToast => {
  return listenToForegroundMessages(payload => {
    const { notification, data } = payload;

    if (notification) {
      // Mostrar toast com a notificação
      showToast({
        title: notification.title || 'Nova Notificação',
        message: notification.body || '',
        type: data?.type || 'info',
        duration: 5000,
      });

      // Também pode mostrar notificação nativa se desejar
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/logo192.png',
          badge: '/badge.png',
          tag: data?.type || 'default',
        });
      }
    }
  });
};

/**
 * Solicita permissão de notificação se ainda não foi perguntado
 * @returns {Promise<boolean>} True se permissão concedida
 */
export const promptNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return false;
  }

  const permission = getNotificationPermissionStatus();

  if (permission === 'default') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  return permission === 'granted';
};

/**
 * Tipos de notificações disponíveis
 */
export const NOTIFICATION_TYPES = {
  DEBT_DUE: 'debt_due',
  DEBT_OVERDUE: 'debt_overdue',
  GOAL_ACHIEVED: 'goal_achieved',
  GOAL_AT_RISK: 'goal_at_risk',
  MONTHLY_REPORT: 'monthly_report',
  BUDGET_EXCEEDED: 'budget_exceeded',
  REMINDER: 'reminder',
  INSIGHT: 'insight',
};

/**
 * Configurações padrão de notificações por tipo
 */
export const NOTIFICATION_SETTINGS = {
  [NOTIFICATION_TYPES.DEBT_DUE]: {
    enabled: true,
    title: 'Vencimento Próximo',
    icon: '📅',
  },
  [NOTIFICATION_TYPES.DEBT_OVERDUE]: {
    enabled: true,
    title: 'Pagamento Atrasado',
    icon: '⚠️',
  },
  [NOTIFICATION_TYPES.GOAL_ACHIEVED]: {
    enabled: true,
    title: 'Meta Alcançada',
    icon: '🎉',
  },
  [NOTIFICATION_TYPES.GOAL_AT_RISK]: {
    enabled: true,
    title: 'Meta em Risco',
    icon: '⚠️',
  },
  [NOTIFICATION_TYPES.MONTHLY_REPORT]: {
    enabled: true,
    title: 'Relatório Mensal',
    icon: '📊',
  },
  [NOTIFICATION_TYPES.BUDGET_EXCEEDED]: {
    enabled: true,
    title: 'Orçamento Excedido',
    icon: '💸',
  },
  [NOTIFICATION_TYPES.REMINDER]: {
    enabled: true,
    title: 'Lembrete',
    icon: '🔔',
  },
  [NOTIFICATION_TYPES.INSIGHT]: {
    enabled: true,
    title: 'Novo Insight',
    icon: '💡',
  },
};
