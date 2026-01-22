import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ExpenseChart from '../components/ExpenseChart';
import Header from '../components/Header';
import InsightCard from '../components/InsightCard';
import { getDebts } from '../services/debts.service';
import { getExpenses } from '../services/expenses.service';
import { getIncomes } from '../services/income.service';
import { useAuthStore } from '../store/authStore';
import {
  calculateAvailableBalance,
  calculateTotalDebts,
  calculateTotalExpenses,
  calculateTotalIncome,
  getTopExpenses,
} from '../utils/calculations';
import { formatCurrency, getCategoryById as getCategory } from '../utils/constants';
import { generateCurrentMonthInsights, sortInsightsByPriority } from '../utils/insightsGenerator';

/**
 * Página do Dashboard
 * Exibe resumo financeiro e navegação principal
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [debts, setDebts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const [expensesData, incomesData, debtsData, insightsData] = await Promise.all([
          getExpenses(user.uid, currentMonth, currentYear),
          getIncomes(user.uid, currentMonth, currentYear),
          getDebts(user.uid),
          generateCurrentMonthInsights(user.uid),
        ]);

        setExpenses(expensesData || []);
        setIncomes(incomesData || []);
        setDebts(debtsData || []);

        // Ordenar e pegar apenas os top 3 insights
        const sortedInsights = sortInsightsByPriority(insightsData || []);
        setInsights(sortedInsights.slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, currentMonth, currentYear]);

  // Cálculos
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const availableBalance = calculateAvailableBalance(totalIncome, totalExpenses);
  const totalDebts = calculateTotalDebts(debts);
  const topExpenses = getTopExpenses(expenses, 3);

  // Determinar cor do saldo
  const getBalanceColor = () => {
    if (availableBalance < 0) return 'text-red-600';
    if (availableBalance < totalIncome * 0.2) return 'text-yellow-600';
    return 'text-blue-600';
  };

  // Determinar cor dos gastos
  const getExpensesColor = () => {
    if (totalIncome === 0) return 'text-red-600';
    const percentage = (totalExpenses / totalIncome) * 100;
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Cards de resumo
  const summaryCards = [
    {
      title: 'Renda do Mês',
      value: formatCurrency(totalIncome),
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
      textColor: 'text-green-600',
    },
    {
      title: 'Gastos do Mês',
      value: formatCurrency(totalExpenses),
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
      textColor: getExpensesColor(),
    },
    {
      title: 'Saldo Disponível',
      value: formatCurrency(availableBalance),
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
      textColor: getBalanceColor(),
    },
    {
      title: 'Total de Dívidas',
      value: formatCurrency(totalDebts),
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
      textColor: 'text-yellow-600',
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              style={{ marginBottom: '3rem' }}
            >
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
                  <p className={`text-2xl font-bold ${card.textColor || 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Botões de ação rápida */}
            <div className="mb-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/expenses')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nova Despesa
              </button>
              <button
                onClick={() => navigate('/debts')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-md border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Ver Dívidas
              </button>
              <button
                onClick={() => navigate('/income')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-md border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Ver Rendas
              </button>
            </div>

            {/* Grid com duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de despesas */}
              <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '2rem' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Gastos por Categoria</h3>
                <ExpenseChart expenses={expenses} />
              </div>

              {/* Resumo e Top 3 */}
              <div className="space-y-6">
                {/* Top 3 Gastos */}
                <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '2rem' }}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Maiores Gastos</h3>
                  {topExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {topExpenses.map((expense, index) => {
                        const category = getCategory(expense.category);
                        return (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{expense.description}</p>
                                <p className="text-sm text-gray-600">
                                  {category.icon} {category.name}
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma despesa registrada</p>
                  )}
                </div>

                {/* Resumo Rápido */}
                <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '2rem' }}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Mês</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Total de Rendas</span>
                      <span className="text-green-600 font-bold">{incomes.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Total de Despesas</span>
                      <span className="text-red-600 font-bold">{expenses.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Dívidas Ativas</span>
                      <span className="text-yellow-600 font-bold">
                        {debts.filter(d => d.status === 'active').length}
                      </span>
                    </div>
                    {totalIncome > 0 && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 font-medium">% de Gastos</span>
                        <span className="text-blue-600 font-bold">
                          {((totalExpenses / totalIncome) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights do Mês */}
            {insights.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">💡 Insights do Mês</h3>
                  <button
                    onClick={() => navigate('/insights')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    Ver todos
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
