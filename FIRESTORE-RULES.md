# Regras de Segurança do Firestore

## Status

✅ **Regras deployadas com sucesso via Firebase CLI**

## Configuração

### Arquivos Criados

- `firestore.rules` - Regras de segurança do Firestore
- `firebase.json` - Configuração do projeto Firebase
- `firestore.indexes.json` - Índices do Firestore
- `.firebaserc` - Identificação do projeto

### Deploy das Regras

```bash
firebase deploy --only firestore:rules
```

## Estrutura das Regras

### Princípios de Segurança

1. **Autenticação obrigatória**: Todas as operações exigem usuário autenticado
2. **Isolamento de dados**: Usuários só acessam seus próprios documentos
3. **Validação de userId**: Todas as operações validam que `userId` corresponde ao usuário autenticado

### Coleções Protegidas

#### 1. Expenses (Despesas)

- **Read**: Somente documentos onde `userId == auth.uid`
- **Create**: Somente se `request.resource.data.userId == auth.uid`
- **Update**: Somente documentos onde `userId == auth.uid`
- **Delete**: Somente documentos onde `userId == auth.uid`

#### 2. Incomes (Rendas)

- **Read**: Somente documentos onde `userId == auth.uid`
- **Create**: Somente se `request.resource.data.userId == auth.uid`
- **Update**: Somente documentos onde `userId == auth.uid`
- **Delete**: Somente documentos onde `userId == auth.uid`

#### 3. Debts (Dívidas)

- **Read**: Somente documentos onde `userId == auth.uid`
- **Create**: Somente se `request.resource.data.userId == auth.uid`
- **Update**: Somente documentos onde `userId == auth.uid`
- **Delete**: Somente documentos onde `userId == auth.uid`

#### 4. Users (Usuários)

- **Read**: Somente o próprio documento (`userId == auth.uid`)
- **Create**: Somente o próprio documento
- **Update**: Somente o próprio documento
- **Delete**: Somente o próprio documento

## Funções Auxiliares

```javascript
// Verifica se o usuário está autenticado
function isAuthenticated() {
  return request.auth != null;
}

// Verifica se o usuário é dono do documento
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

## Estrutura de Dados

### Expense Document

```javascript
{
  userId: "string",           // Obrigatório
  description: "string",
  amount: number,
  category: "string",
  paymentMethod: "string",
  date: Timestamp,
  isFixed: boolean,
  createdAt: Timestamp
}
```

### Income Document

```javascript
{
  userId: "string",           // Obrigatório
  description: "string",
  amount: number,
  type: "salary" | "extra",
  date: Timestamp,
  received: boolean,
  createdAt: Timestamp
}
```

### Debt Document

```javascript
{
  userId: "string",           // Obrigatório
  name: "string",
  totalAmount: number,
  remainingAmount: number,
  installmentValue: number,
  totalInstallments: number,
  paidInstallments: number,
  interestRate: number,
  dueDay: number,
  type: "credit_card" | "loan" | "financing",
  priority: number,
  status: "active" | "paid",
  createdAt: Timestamp
}
```

## Testando as Regras

### Via Console do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/project/financeiro-d8095/firestore/rules)
2. Vá para Firestore Database > Rules
3. Use o simulador de regras para testar cenários

### Via Código

As regras estão funcionando se:

- ✅ Usuários autenticados podem criar/ler/atualizar/deletar seus próprios documentos
- ❌ Usuários não podem acessar documentos de outros usuários
- ❌ Usuários não autenticados não podem realizar nenhuma operação

## Troubleshooting

### Erro: "Missing or insufficient permissions"

**Causa**: Regras não estão deployadas ou usuário não está autenticado

**Solução**:

1. Verificar se o usuário está autenticado
2. Fazer deploy das regras: `firebase deploy --only firestore:rules`
3. Verificar se o `userId` está sendo enviado corretamente nos documentos

### Verificar Regras Ativas

```bash
firebase firestore:rules:list
```

### Ver Regras no Console

```bash
firebase firestore:rules:get
```

## Manutenção

### Atualizar Regras

1. Edite o arquivo `firestore.rules`
2. Execute: `firebase deploy --only firestore:rules`
3. Verifique no console se foram aplicadas

### Adicionar Nova Coleção

1. Adicione um novo bloco `match` em `firestore.rules`
2. Siga o mesmo padrão de autenticação e validação
3. Deploy das regras

## Logs e Monitoramento

Acesse o [Firebase Console](https://console.firebase.google.com/project/financeiro-d8095/overview) para:

- Ver logs de acesso negado
- Monitorar operações de leitura/escrita
- Identificar problemas de segurança
