/**
 * Componente de configurações de notificações
 * Permite usuário habilitar/desabilitar notificações push
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import {
  getNotificationPermissionStatus,
  isNotificationSupported,
  NOTIFICATION_SETTINGS,
  NOTIFICATION_TYPES,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '../services/notifications.service';
import { useAuthStore } from '../store/authStore';

/**
 * Página de configurações de notificações
 */
const NotificationSettings = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [notificationTypes, setNotificationTypes] = useState(NOTIFICATION_SETTINGS);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }

    // Verificar status da permissão
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
    setIsEnabled(status === 'granted');
  }, [user, navigate]);

  /**
   * Habilita notificações
   */
  const handleEnableNotifications = async () => {
    setLoading(true);

    try {
      const success = await subscribeToNotifications(user.uid);

      if (success) {
        setIsEnabled(true);
        setPermissionStatus('granted');
        // Animação de sucesso
        const button = document.querySelector('.success-animation');
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        }
        alert('✅ Notificações habilitadas com sucesso!');
      } else {
        alert('❌ Não foi possível habilitar notificações. Verifique as permissões do navegador.');
      }
    } catch (error) {
      console.error('Erro ao habilitar notificações:', error);
      alert('Erro ao habilitar notificações');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Desabilita notificações
   */
  const handleDisableNotifications = async () => {
    setLoading(true);

    try {
      await unsubscribeFromNotifications(user.uid);
      setIsEnabled(false);
      alert('🔕 Notificações desabilitadas');
    } catch (error) {
      console.error('Erro ao desabilitar notificações:', error);
      alert('Erro ao desabilitar notificações');
    } finally {
      setLoading(false);
    }
  };

  if (!isNotificationSupported()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
            >
              ← Voltar
            </button>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">🔔 Notificações</h1>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Notificações Não Suportadas
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Seu navegador não suporta notificações push. Por favor, use um navegador moderno
                como Chrome, Firefox ou Edge.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
          >
            ← Voltar
          </button>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            🔔 Configurações de Notificações
          </h1>

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Status das Notificações</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isEnabled ? 'Você está recebendo notificações' : 'Notificações desabilitadas'}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  isEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {isEnabled ? '🔔' : '🔕'}
              </div>
            </div>

            {permissionStatus === 'denied' && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ Você bloqueou as notificações para este site. Para reativar, você precisa
                  alterar as configurações do navegador manualmente.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {!isEnabled ? (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={loading || permissionStatus === 'denied'}
                  className="flex-1 success-animation transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Habilitando...
                    </span>
                  ) : (
                    '🔔 Habilitar Notificações'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1 transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Desabilitando...
                    </span>
                  ) : (
                    '🔕 Desabilitar Notificações'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tipos de Notificações */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tipos de Notificações</h3>

            <div className="space-y-4">
              {Object.entries(notificationTypes).map(([type, config]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl transition-transform duration-200 hover:scale-110">
                      {config.icon}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{config.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getNotificationDescription(type)}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      disabled={!isEnabled}
                      onChange={() => {
                        setNotificationTypes(prev => ({
                          ...prev,
                          [type]: { ...prev[type], enabled: !prev[type].enabled },
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-all duration-300"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">ℹ️ Sobre as Notificações</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Você será notificado sobre vencimentos de dívidas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Receberá alertas quando metas estiverem em risco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Insights automáticos sobre seus gastos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Relatórios mensais de suas finanças</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>Lembretes para registrar gastos diários</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Retorna descrição de cada tipo de notificação
 */
const getNotificationDescription = type => {
  const descriptions = {
    [NOTIFICATION_TYPES.DEBT_DUE]: 'Lembrete 1 dia antes do vencimento',
    [NOTIFICATION_TYPES.DEBT_OVERDUE]: 'Aviso de pagamento atrasado',
    [NOTIFICATION_TYPES.GOAL_ACHIEVED]: 'Quando você atingir uma meta',
    [NOTIFICATION_TYPES.GOAL_AT_RISK]: 'Quando uma meta estiver em risco',
    [NOTIFICATION_TYPES.MONTHLY_REPORT]: 'Resumo mensal de gastos',
    [NOTIFICATION_TYPES.BUDGET_EXCEEDED]: 'Quando exceder o orçamento',
    [NOTIFICATION_TYPES.REMINDER]: 'Lembretes diários de registro',
    [NOTIFICATION_TYPES.INSIGHT]: 'Insights sobre seus gastos',
  };

  return descriptions[type] || '';
};

export default NotificationSettings;
