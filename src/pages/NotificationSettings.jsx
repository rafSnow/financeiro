/**
 * Componente de configurações de notificações
 * Permite usuário habilitar/desabilitar notificações push
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';
import {
  getNotificationPermissionStatus,
  isNotificationSupported,
  NOTIFICATION_SETTINGS,
  NOTIFICATION_TYPES,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '../services/notifications.service';

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Voltar
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">🔔 Notificações</h1>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Notificações Não Suportadas
              </h3>
              <p className="text-sm text-yellow-700">
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Voltar
          </button>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">🔔 Configurações de Notificações</h1>

          {/* Status Card */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Status das Notificações
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isEnabled
                    ? 'Você está recebendo notificações'
                    : 'Notificações desabilitadas'}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  isEnabled ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                {isEnabled ? '🔔' : '🔕'}
              </div>
            </div>

            {permissionStatus === 'denied' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700">
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
                  className="flex-1"
                >
                  {loading ? 'Habilitando...' : '🔔 Habilitar Notificações'}
                </Button>
              ) : (
                <Button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1"
                >
                  {loading ? 'Desabilitando...' : '🔕 Desabilitar Notificações'}
                </Button>
              )}
            </div>
          </div>

          {/* Tipos de Notificações */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tipos de Notificações
            </h3>

            <div className="space-y-4">
              {Object.entries(notificationTypes).map(([type, config]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{config.title}</div>
                      <div className="text-xs text-gray-500">{getNotificationDescription(type)}</div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              ℹ️ Sobre as Notificações
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Você será notificado sobre vencimentos de dívidas</li>
              <li>• Receberá alertas quando metas estiverem em risco</li>
              <li>• Insights automáticos sobre seus gastos</li>
              <li>• Relatórios mensais de suas finanças</li>
              <li>• Lembretes para registrar gastos diários</li>
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
