import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { db } from '../services/firebase';
import { formatDate, getCategoryById } from './constants';

/**
 * Busca todas as despesas do usuário (todos os meses)
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as despesas
 */
const getAllExpenses = async userId => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar todas as despesas:', error);
    throw error;
  }
};

/**
 * Busca todas as dívidas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as dívidas
 */
const getAllDebts = async userId => {
  try {
    const q = query(collection(db, 'debts'), where('userId', '==', userId), orderBy('name'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar todas as dívidas:', error);
    throw error;
  }
};

/**
 * Busca todas as rendas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as rendas
 */
const getAllIncomes = async userId => {
  try {
    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar todas as rendas:', error);
    throw error;
  }
};

/**
 * Busca todas as metas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de todas as metas
 */
const getAllGoals = async userId => {
  try {
    const q = query(collection(db, 'goals'), where('userId', '==', userId), orderBy('name'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar todas as metas:', error);
    throw error;
  }
};

/**
 * Exporta dados para CSV usando PapaParse
 * @param {string} userId - ID do usuário
 * @param {string} type - Tipo de dados (expenses, debts, incomes, goals)
 * @returns {Promise<void>}
 */
export const exportToCSV = async (userId, type = 'expenses') => {
  try {
    let data = [];
    let filename = '';

    if (type === 'expenses') {
      const expenses = await getAllExpenses(userId);
      data = expenses.map(e => {
        const category = getCategoryById(e.category);
        return {
          Data: formatDate(e.date),
          Descrição: e.description,
          Valor: e.amount,
          Categoria: category.name,
          'Forma de Pagamento': e.paymentMethod || 'Não especificado',
          'Fixa?': e.isFixed ? 'Sim' : 'Não',
        };
      });
      filename = 'despesas';
    } else if (type === 'debts') {
      const debts = await getAllDebts(userId);
      data = debts.map(d => ({
        Nome: d.name,
        'Valor Total': d.totalAmount,
        'Valor Restante': d.remainingAmount,
        'Valor da Parcela': d.installmentValue,
        'Parcelas Totais': d.totalInstallments,
        'Parcelas Pagas': d.paidInstallments,
        'Taxa de Juros (%)': d.interestRate,
        'Dia de Vencimento': d.dueDay,
        Status: d.status,
        Método: d.method || 'Não especificado',
      }));
      filename = 'dividas';
    } else if (type === 'incomes') {
      const incomes = await getAllIncomes(userId);
      data = incomes.map(i => ({
        Data: formatDate(i.date),
        Descrição: i.description,
        Valor: i.amount,
        'Fixa?': i.isRecurring ? 'Sim' : 'Não',
      }));
      filename = 'rendas';
    } else if (type === 'goals') {
      const goals = await getAllGoals(userId);
      data = goals.map(g => ({
        Nome: g.name,
        'Valor Alvo': g.targetAmount,
        'Valor Atual': g.currentAmount,
        'Data Limite': formatDate(g.targetDate),
        Categoria: g.category,
        Progresso: `${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%`,
      }));
      filename = 'metas';
    }

    if (data.length === 0) {
      throw new Error('Nenhum dado disponível para exportar');
    }

    const csv = Papa.unparse(data);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};

/**
 * Exporta todos os dados para Excel (XLSX)
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
export const exportToExcel = async userId => {
  try {
    const workbook = XLSX.utils.book_new();

    // Aba de despesas
    const expenses = await getAllExpenses(userId);
    if (expenses.length > 0) {
      const expensesData = expenses.map(e => {
        const category = getCategoryById(e.category);
        return {
          Data: formatDate(e.date),
          Descrição: e.description,
          Valor: e.amount,
          Categoria: category.name,
          'Forma de Pagamento': e.paymentMethod || 'Não especificado',
          Fixa: e.isFixed ? 'Sim' : 'Não',
        };
      });
      const expensesWS = XLSX.utils.json_to_sheet(expensesData);
      XLSX.utils.book_append_sheet(workbook, expensesWS, 'Despesas');
    }

    // Aba de rendas
    const incomes = await getAllIncomes(userId);
    if (incomes.length > 0) {
      const incomesData = incomes.map(i => ({
        Data: formatDate(i.date),
        Descrição: i.description,
        Valor: i.amount,
        Recorrente: i.isRecurring ? 'Sim' : 'Não',
      }));
      const incomesWS = XLSX.utils.json_to_sheet(incomesData);
      XLSX.utils.book_append_sheet(workbook, incomesWS, 'Rendas');
    }

    // Aba de dívidas
    const debts = await getAllDebts(userId);
    if (debts.length > 0) {
      const debtsData = debts.map(d => ({
        Nome: d.name,
        'Valor Total': d.totalAmount,
        'Valor Restante': d.remainingAmount,
        'Valor da Parcela': d.installmentValue,
        'Parcelas Totais': d.totalInstallments,
        'Parcelas Pagas': d.paidInstallments,
        'Taxa de Juros (%)': d.interestRate,
        'Dia de Vencimento': d.dueDay,
        Status: d.status,
        Método: d.method || 'Não especificado',
      }));
      const debtsWS = XLSX.utils.json_to_sheet(debtsData);
      XLSX.utils.book_append_sheet(workbook, debtsWS, 'Dívidas');
    }

    // Aba de metas
    const goals = await getAllGoals(userId);
    if (goals.length > 0) {
      const goalsData = goals.map(g => ({
        Nome: g.name,
        'Valor Alvo': g.targetAmount,
        'Valor Atual': g.currentAmount,
        'Data Limite': formatDate(g.targetDate),
        Categoria: g.category,
        Progresso: `${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%`,
      }));
      const goalsWS = XLSX.utils.json_to_sheet(goalsData);
      XLSX.utils.book_append_sheet(workbook, goalsWS, 'Metas');
    }

    // Download
    XLSX.writeFile(workbook, `financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw error;
  }
};
