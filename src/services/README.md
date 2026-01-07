# 🔧 Services

Serviços para comunicação com APIs e Firebase.

## Services previstas

- `firebase.js` - Configuração do Firebase
- `auth.service.js` - Autenticação
- `expenses.service.js` - Operações de despesas
- `debts.service.js` - Operações de dívidas
- `goals.service.js` - Operações de metas

## Padrão

```javascript
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export const createExpense = async data => {
  const docRef = await addDoc(collection(db, 'expenses'), data);
  return docRef.id;
};
```
