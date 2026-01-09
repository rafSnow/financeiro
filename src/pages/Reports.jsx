import { useCallback, useEffect, useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpensesPieChart from '../components/ExpensesPieChart';
import ExpensesTrendChart from '../components/ExpensesTrendChart';
import Header from '../components/Header';
import InsightsPanel from '../components/InsightsPanel';
import MonthlyEvolutionChart from '../components/MonthlyEvolutionChart';
import MonthSummary from '../components/MonthSummary';
import TopExpenses from '../components/TopExpenses';
import { getExpenses } from '../services/expenses.service';
import { getGoals } from '../services/goals.service';
import { getIncomes } from '../services/income.service';
import { useAuthStore } from '../store/authStore';

/**
 * Página de Relatórios Financeiros
 * Exibe resumo mensal, comparações e gráficos
 */
const Reports = () => {
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [currentExpenses, setCurrentExpenses] = useState([]);
  const [previousExpenses, setPreviousExpenses] = useState([]);
  const [goals, setGoals] = useState([]);

  /**
   * Nomes dos meses
   */
  const monthNames = useMemo(
    () => [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    []
  );

  /**
   * Nomes curtos dos meses
   */
  const shortMonthNames = useMemo(
    () => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    []
  );

  /**
   * Carrega dados do mês selecionado
   */
  const loadMonthData = useCallback(
    async (month, year) => {
      try {
        const [expenses, incomes] = await Promise.all([
          getExpenses(user.uid, month, year),
          getIncomes(user.uid, month, year),
        ]);

        // Calcular totais
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        // Agrupar gastos por categoria
        const categoryMap = {};
        expenses.forEach(exp => {
          const category = exp.category || 'Outros';
          categoryMap[category] = (categoryMap[category] || 0) + exp.amount;
        });

        // Converter para array para o gráfico de pizza
        const categoryArray = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
          percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0,
        }));

        return {
          income: totalIncome,
          expenses: totalExpenses,
          balance,
          savingsRate,
          monthName: monthNames[month - 1],
          categories: categoryArray,
        };
      } catch (error) {
        console.error('Erro ao carregar dados do mês:', error);
        return {
          income: 0,
          expenses: 0,
          balance: 0,
          savingsRate: 0,
          monthName: monthNames[month - 1],
          categories: [],
        };
      }
    },
    [user, monthNames]
  );

  /**
   * Carrega dados para os gráficos de evolução (últimos 6 meses)
   */
  const loadEvolutionData = useCallback(async () => {
    try {
      const monthsData = [];
      const currentDate = new Date(selectedYear, selectedMonth - 1, 1);

      // Carregar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const [expenses, incomes] = await Promise.all([
          getExpenses(user.uid, month, year),
          getIncomes(user.uid, month, year),
        ]);

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

        monthsData.push({
          month: `${shortMonthNames[month - 1]}/${year.toString().slice(2)}`,
          income: totalIncome,
          expenses: totalExpenses,
        });
      }

      return monthsData;
    } catch (error) {
      console.error('Erro ao carregar dados de evolução:', error);
      return [];
    }
  }, [selectedMonth, selectedYear, user, shortMonthNames]);

  /**
   * Carrega todos os dados
   */
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);

      // Carregar metas do usuário
      const userGoals = await getGoals(user.uid);
      setGoals(userGoals);

      // Dados do mês atual
      const [currentExpensesData, currentData] = await Promise.all([
        getExpenses(user.uid, selectedMonth, selectedYear),
        loadMonthData(selectedMonth, selectedYear),
      ]);
      setCurrentExpenses(currentExpensesData);
      setCurrentMonthData(currentData);
      setCategoryData(currentData.categories);

      // Dados do mês anterior
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      const [previousExpensesData, previousData] = await Promise.all([
        getExpenses(user.uid, prevMonth, prevYear),
        loadMonthData(prevMonth, prevYear),
      ]);
      setPreviousExpenses(previousExpensesData);
      setPreviousMonthData(previousData);

      // Dados de evolução (últimos 6 meses)
      const evolution = await loadEvolutionData();
      setEvolutionData(evolution);
      setTrendData(evolution);

      setLoading(false);
    };

    loadData();
  }, [selectedMonth, selectedYear, user, loadMonthData, loadEvolutionData]);

  /**
   * Altera o mês selecionado
   */
  const handleMonthChange = e => {
    setSelectedMonth(Number(e.target.value));
  };

  /**
   * Altera o ano selecionado
   */
  const handleYearChange = e => {
    setSelectedYear(Number(e.target.value));
  };

  /**
   * Gera lista de anos (últimos 5 anos)
   */
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando relatórios...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Cabeçalho com seletores */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">📊 Relatórios Financeiros</h1>

          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={handleYearChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getYearOptions().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumo do mês */}
        <div className="mb-8">
          <MonthSummary currentMonth={currentMonthData} previousMonth={previousMonthData} />
        </div>

        {/* Gráficos */}
        <div className="space-y-6">
          {/* Painel de Insights */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>Insights e Recomendações</span>
            </h3>
            <InsightsPanel
              currentData={currentMonthData || {}}
              previousData={previousMonthData}
              goals={goals}
            />
          </div>

          {/* Top Despesas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Gastos</h3>
            <TopExpenses expenses={currentExpenses} previousExpenses={previousExpenses} />
          </div>

          {/* Breakdown por Categoria */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Categoria</h3>
            <CategoryBreakdown
              expenses={currentExpenses}
              totalExpenses={currentMonthData?.expenses || 0}
            />
          </div>

          {/* Gráfico de Pizza - Gastos por Categoria */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoria</h3>
            <ExpensesPieChart data={categoryData} />
          </div>

          {/* Gráfico de Barras - Evolução Mensal */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Evolução Mensal (Últimos 6 Meses)
            </h3>
            <MonthlyEvolutionChart data={evolutionData} />
          </div>

          {/* Gráfico de Linhas - Tendência de Gastos */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Gastos</h3>
            <ExpensesTrendChart data={trendData} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Reports;
