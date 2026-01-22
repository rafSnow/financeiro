# 💰 Financeiro - Sistema de Controle Financeiro Pessoal

Sistema completo de gestão financeira pessoal com foco em quitação de dívidas usando o método bola de neve.

## ✨ Features Implementadas

### 🔐 Autenticação
- Login e cadastro de usuários
- Recuperação de senha
- Persistência de sessão

### 💸 Controle de Despesas
- Cadastro, edição e exclusão de despesas
- Categorização de despesas
- Filtros por período e categoria
- Visualização em lista e gráficos
- Importação de extratos CSV/OFX
- Recategorização inteligente em lote
- Métricas de categorização

### 💰 Controle de Rendas
- Cadastro de rendas fixas e variáveis
- Visualização mensal
- Comparativo com despesas

### 🔴 Gerenciamento de Dívidas
- Cadastro de dívidas com juros
- Método Bola de Neve (Snowball)
- Método Avalanche
- Simulador de quitação
- Tabela de amortização
- Histórico de pagamentos
- Insights e projeções

### 🎯 Metas Financeiras
- Criação de metas com valor alvo
- Acompanhamento de progresso
- Notificações de progresso

### 📊 Dashboard e Insights
- Visão geral financeira
- Gráficos de evolução mensal
- Top despesas por categoria
- Análise de tendências
- Insights automáticos baseados em IA
- Métricas de desempenho financeiro

### 🏷️ Categorias
- Sistema de categorias customizáveis
- Ícones e cores personalizadas
- Sugestões automáticas de categorização

### 📥 Importação
- Suporte para arquivos CSV e OFX
- Mapeamento de colunas
- Preview antes da importação
- Detecção automática de formato

### 🔔 Sistema de Alertas
- Alertas de metas próximas
- Alertas de dívidas próximas do vencimento
- Alertas de orçamento excedido
- Sistema de notificações com badge
- Notificações push (PWA)

### 💾 Backup e Exportação
- Backup automático no Firebase
- Exportação de dados em CSV
- Exportação de dados em Excel
- Backup manual sob demanda

### 🎨 Interface e UX
- Modo escuro completo
- Tema claro/escuro com persistência
- Animações com Framer Motion
- Toast notifications com react-hot-toast
- Skeleton loading states
- Empty states informativos
- Design responsivo (mobile-first)
- Navegação intuitiva com bottom nav

### ⚡ Performance
- Code splitting com React.lazy
- Memoização com useMemo/useCallback
- Paginação de dados
- Service Worker para cache
- Cache strategies otimizadas

### ♿ Acessibilidade
- ARIA labels em componentes
- Navegação por teclado
- Suporte a screen readers
- Contraste WCAG AA

### 🔍 SEO
- Meta tags otimizadas
- Open Graph tags (Facebook)
- Twitter Cards
- PWA manifest

## 🚀 Tecnologias

### Frontend
- **React 19.2.0** - Framework frontend
- **Vite 7.2.4** - Build tool e dev server
- **Tailwind CSS 4.0.0** - Framework CSS
- **React Router 7.3.0** - Navegação
- **Framer Motion 11.20.0** - Animações
- **React Hot Toast 2.4.1** - Notificações

### Backend
- **Firebase 12.7.0** - Backend completo
  - Firestore Database - Banco de dados
  - Authentication - Autenticação
  - Cloud Functions - Serverless (opcional)

### Estado e Dados
- **Zustand 5.0.3** - Gerenciamento de estado
- **date-fns 4.1.0** - Manipulação de datas
- **xlsx 0.18.5** - Exportação Excel

### PWA
- **Workbox** - Service Worker
- **Web App Manifest** - Instalação
- **Push Notifications** - Notificações

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

# Lint
npm run lint
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis (40+ componentes)
│   ├── Animations.jsx    # Componentes com animações
│   ├── Button.jsx        # Botão com estados e variantes
│   ├── Modal.jsx         # Modal acessível
│   ├── Header.jsx        # Header com navegação
│   ├── BottomNav.jsx     # Navegação mobile
│   └── ...
├── pages/          # Páginas da aplicação (12 páginas)
│   ├── Dashboard.jsx     # Dashboard principal
│   ├── Expenses.jsx      # Gerenciamento de despesas
│   ├── Debts.jsx         # Gerenciamento de dívidas
│   └── ...
├── store/          # Stores Zustand (auth, toast)
├── services/       # Serviços Firebase (10+ services)
│   ├── expenses.service.js
│   ├── debts.service.js
│   ├── backup.service.js
│   └── ...
├── utils/          # Funções auxiliares
│   ├── formatters.js     # Formatação de moeda/data
│   ├── exportData.js     # Exportação CSV/Excel
│   └── alertRules.js     # Regras de alertas
├── hooks/          # Custom hooks
│   ├── useToast.js
│   └── useOnlineStatus.js
├── contexts/       # React contexts
│   └── ThemeContext.jsx  # Gerenciamento de tema
└── styles/         # Estilos globais
```

## 🔧 Configuração

### 1. Firebase Setup

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Habilitar Firestore Database
4. Copiar as credenciais do Firebase

### 2. Variáveis de Ambiente

Criar arquivo `.env.local` na raiz:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-auth-domain
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

### 3. Firestore Rules

Configurar regras de segurança no Firestore (ver `firestore.rules`).

### 4. PWA Configuration

O app já está configurado como PWA:
- Service Worker em `public/firebase-messaging-sw.js`
- Manifest em `firebase.json`
- Ícones em `public/`

## 📱 Como Usar

### Primeiro Acesso
1. Criar conta ou fazer login
2. Adicionar suas despesas e rendas
3. Cadastrar suas dívidas (se houver)
4. Definir metas financeiras

### Controle de Despesas
1. Acessar "Despesas"
2. Clicar em "Nova Despesa"
3. Preencher dados (valor, categoria, data)
4. Visualizar em lista ou gráficos

### Gerenciamento de Dívidas
1. Acessar "Dívidas"
2. Adicionar suas dívidas
3. Escolher método de quitação (Bola de Neve ou Avalanche)
4. Visualizar simulação e tabela de amortização
5. Registrar pagamentos

### Importação de Extratos
1. Acessar "Importar"
2. Fazer upload de arquivo CSV ou OFX
3. Mapear colunas
4. Revisar preview
5. Confirmar importação

### Backup e Exportação
1. Acessar "Configurações"
2. Escolher tipo de backup/exportação
3. Backup automático salva no Firebase
4. Exportação gera arquivo CSV/Excel

## 🎨 Personalização

### Tema
- Alternar entre claro/escuro no header
- Tema persiste entre sessões
- Suporta preferência do sistema

### Categorias
- Criar categorias customizadas
- Escolher ícone e cor
- Organizar despesas por categoria

## 🔐 Segurança

- Autenticação com Firebase Auth
- Dados criptografados no Firestore
- Regras de segurança configuradas
- Cada usuário acessa apenas seus dados

## 📊 Relatórios

- Dashboard com métricas principais
- Gráficos de evolução mensal
- Análise de despesas por categoria
- Insights automáticos
- Projeções de quitação de dívidas

## 🛣️ Roadmap

### Sprint 8 ✅ (Completa)
- ✅ Modo Escuro
- ✅ Sistema de Backup
- ✅ Exportação CSV/Excel
- ✅ Melhorias de UX/UI
- ✅ Otimizações de Performance
- ✅ Polish Final (SEO, Acessibilidade)

### Próximas Features
- [ ] Controle de investimentos
- [ ] Open Finance integration
- [ ] Modo família
- [ ] Planejamento de aposentadoria
- [ ] Analytics com Vercel Analytics
- [ ] Testes automatizados

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📝 Changelog

### v0.8.0 - Sprint 8 (Fevereiro 2025)
- Adicionado modo escuro completo
- Sistema de backup e restauração
- Exportação CSV/Excel
- Animações com Framer Motion
- Skeleton loading states
- Otimizações de performance
- SEO e acessibilidade

### v0.7.0 - Sprint 7 (Janeiro 2025)
- Sistema de alertas
- Notificações push
- Métricas de categorização
- Insights automáticos

### v0.6.0 - Sprint 6 (Janeiro 2025)
- Importação OFX
- Recategorização em lote
- Melhorias no dashboard

### v0.1.0 - v0.5.0 (Dezembro 2024 - Janeiro 2025)
- MVP inicial
- Autenticação
- Controle de despesas e rendas
- Gerenciamento de dívidas
- Dashboard básico

## 📄 Licença

MIT

## 👨‍💻 Desenvolvimento

**Sprint atual:** Sprint 8 - Completa  
**Documentação completa:** `../financeiro-docs/`

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

## 📞 Suporte

Para suporte, abra uma issue no repositório.

---

**Status:** ✅ Versão estável  
**Versão:** 0.8.0  
**Última atualização:** Fevereiro 2025
