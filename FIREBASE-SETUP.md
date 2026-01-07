# 🔥 Configuração do Firebase

Este guia mostra como configurar o Firebase para o projeto.

## 📋 Pré-requisitos

- Conta Google
- Acesso ao [Firebase Console](https://console.firebase.google.com/)

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `financeiro-app` (ou nome de sua preferência)
4. Desabilite Google Analytics (opcional para MVP)
5. Clique em "Criar projeto"

### 2. Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", habilite:
   - ✅ **Email/Password** (habilitar)
   - Clique em "Salvar"

### 3. Configurar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Modo: **Produção** (ou Teste para desenvolvimento)
4. Local: **southamerica-east1 (São Paulo)** (ou mais próximo)
5. Clique em "Ativar"

#### Regras de Segurança (Firestore Rules)

No Firestore, vá em "Regras" e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Despesas
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Dívidas
    match /debts/{debtId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Metas
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

Publique as regras.

### 4. Obter Credenciais do Projeto

1. No menu lateral, clique no ícone de **Engrenagem ⚙️** > "Configurações do projeto"
2. Role até a seção **Seus aplicativos**
3. Clique no ícone **</>** (Web)
4. Apelido do app: `financeiro-web`
5. **NÃO** marque "Firebase Hosting"
6. Clique em "Registrar app"
7. Copie o objeto `firebaseConfig`

Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "financeiro-app-xxxxx.firebaseapp.com",
  projectId: "financeiro-app-xxxxx",
  storageBucket: "financeiro-app-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 5. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Abra `.env.local` e preencha com suas credenciais:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=financeiro-app-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=financeiro-app-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=financeiro-app-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

3. **IMPORTANTE:** Nunca commite o arquivo `.env.local` no Git!

### 6. Testar Conexão

Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra o console do navegador (F12) e verifique se não há erros de conexão com Firebase.

## 📚 Estrutura de Dados

### Coleção: `users`

```javascript
{
  name: "João Silva",
  email: "joao@email.com",
  salary: 5000,
  createdAt: Timestamp
}
```

### Coleção: `expenses`

```javascript
{
  userId: "uid-do-usuario",
  description: "Mercado",
  amount: 350.50,
  category: "alimentacao",
  date: Timestamp,
  createdAt: Timestamp
}
```

### Coleção: `debts`

```javascript
{
  userId: "uid-do-usuario",
  name: "Cartão Nubank",
  totalAmount: 2500,
  remainingAmount: 1800,
  minimumPayment: 120,
  dueDate: 15,
  interestRate: 12.5,
  isPriority: true,
  createdAt: Timestamp
}
```

### Coleção: `goals`

```javascript
{
  userId: "uid-do-usuario",
  name: "Fundo de emergência",
  targetAmount: 10000,
  currentAmount: 2500,
  deadline: Timestamp,
  createdAt: Timestamp
}
```

## 🔒 Segurança

- ✅ Arquivo `.env.local` está no `.gitignore`
- ✅ Regras de segurança do Firestore configuradas
- ✅ Authentication habilitado apenas com Email/Password
- ✅ Cada usuário acessa apenas seus próprios dados

## 🐛 Solução de Problemas

### Erro: "Firebase: Error (auth/...)"

Verifique se:
- As credenciais no `.env.local` estão corretas
- O Authentication está habilitado no Firebase Console
- O servidor de desenvolvimento foi reiniciado após criar `.env.local`

### Erro: "Missing or insufficient permissions"

- Verifique as regras de segurança do Firestore
- Certifique-se de que o usuário está autenticado
- Verifique se o `userId` está correto nos documentos

## ✅ Checklist

- [ ] Projeto criado no Firebase Console
- [ ] Authentication (Email/Password) habilitado
- [ ] Firestore Database criado
- [ ] Regras de segurança configuradas
- [ ] Credenciais copiadas
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] Servidor reiniciado
- [ ] Sem erros no console

---

**Próximo passo:** [Dia 3 - Telas de Login e Cadastro](../sprints/SPRINT-01.md#-dia-3-telas-de-login-e-cadastro-quinta-0901)
