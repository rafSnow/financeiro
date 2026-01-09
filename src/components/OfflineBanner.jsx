import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Banner que aparece quando o usuário está offline
 * Usa o hook useOnlineStatus para detectar mudanças de conexão
 */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">📡</span>
        <span>Você está offline. Dados serão sincronizados quando voltar online.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
