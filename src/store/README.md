# 🗄️ Store

Gerenciamento de estado global com Zustand.

## Stores previstas

- `authStore.js` - Estado de autenticação
- `expensesStore.js` - Estado de despesas
- `debtsStore.js` - Estado de dívidas
- `goalsStore.js` - Estado de metas

## Padrão

```javascript
import { create } from 'zustand';

export const useAuthStore = create(set => ({
  user: null,
  setUser: user => set({ user }),
  clearUser: () => set({ user: null }),
}));
```
