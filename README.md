# 💰 Financeiro - Sistema de Controle Financeiro Pessoal

Sistema completo de gestão financeira pessoal com foco em quitação de dívidas usando o método bola de neve.

## 🚀 Tecnologias

- **React 19** - Framework frontend
- **Vite** - Build tool e dev server
- **Tailwind CSS 4** - Framework CSS
- **Firebase** - Backend (Firestore + Authentication)
- **Zustand** - Gerenciamento de estado
- **React Router** - Navegação
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas/telas da aplicação
├── store/          # Stores do Zustand
├── services/       # Serviços (Firebase, APIs)
├── utils/          # Funções auxiliares
├── hooks/          # Custom hooks
└── styles/         # Estilos globais
```

## 🎯 Funcionalidades

### Fase 1 - MVP (Atual)

- ✅ Autenticação (Login/Cadastro)
- 🚧 Controle de despesas
- 🚧 Gerenciamento de dívidas
- 🚧 Dashboard com visão geral

### Fase 2 - Essenciais

- ⏳ Método Bola de Neve
- ⏳ Simulador de quitação
- ⏳ Sistema de metas
- ⏳ Relatórios mensais
- ⏳ PWA (Progressive Web App)

### Fase 3 - Automação

- ⏳ Importação de extratos (OFX/CSV)
- ⏳ Categorização automática com IA
- ⏳ Notificações push
- ⏳ Insights automáticos

### Fase 4 - Avançado

- ⏳ Open Finance
- ⏳ Controle de investimentos
- ⏳ Modo família
- ⏳ Planejamento de aposentadoria

## 🔧 Configuração

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Habilitar Firestore Database
4. Copiar as credenciais do Firebase
5. Criar arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-auth-domain
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

## 📱 PWA

Este app será instalável no celular e funcionará offline.

## 📄 Licença

MIT

## 👨‍💻 Desenvolvimento

Sprint atual: **Sprint 1 - Setup + Autenticação**
Veja a documentação completa em `../financeiro-docs/`

---

**Status:** 🚧 Em desenvolvimento
**Versão:** 0.1.0
**Última atualização:** 07/01/2026
