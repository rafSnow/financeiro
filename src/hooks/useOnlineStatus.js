import { useEffect, useState } from 'react';

/**
 * Hook para detectar status de conexão online/offline
 * @returns {boolean} true se online, false se offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexão restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Sem conexão com a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
