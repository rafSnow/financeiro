# 🪝 Hooks

Custom React Hooks.

## Exemplos

- `useAuth.js` - Hook de autenticação
- `useExpenses.js` - Hook para despesas
- `useDebts.js` - Hook para dívidas
- `useOnlineStatus.js` - Detectar status online/offline

## Padrão

```javascript
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```
