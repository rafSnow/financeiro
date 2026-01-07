import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';

/**
 * Página do Dashboard
 * Exibe resumo financeiro e navegação principal
 */
const Dashboard = () => {
  const { user } = useAuthStore();

  // Cards de resumo
  const summaryCards = [
    {
      title: 'Renda do Mês',
      value: user?.salary
        ? `R$ ${user.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'R$ 0,00',
      icon: (
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-green-50',
    },
    {
      title: 'Gastos do Mês',
      value: 'R$ 0,00',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      bgColor: 'bg-red-50',
    },
    {
      title: 'Saldo Disponível',
      value: user?.salary
        ? `R$ ${user.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'R$ 0,00',
      icon: (
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total de Dívidas',
      value: 'R$ 0,00',
      icon: (
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Boas-vindas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Olá, {user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 mt-1">Aqui está um resumo das suas finanças</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              style={{ padding: '1.5rem' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl`}>{card.icon}</div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Área de conteúdo adicional */}
        <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '2rem' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Começando</h3>
          <p className="text-gray-600 mb-6">
            Bem-vindo ao FinanceiroApp! Comece organizando suas finanças:
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p className="text-gray-700">Registre suas despesas mensais</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p className="text-gray-700">Liste todas as suas dívidas</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p className="text-gray-700">Acompanhe seu progresso nos relatórios</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
