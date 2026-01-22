import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import {
  createBackup,
  downloadBackup,
  getBackups,
  restoreBackup,
  saveBackupToCloud,
} from '../services/backup.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { formatDate } from '../utils/constants';
import { exportToCSV, exportToExcel } from '../utils/exportData';

/**
 * Página de configurações e backup
 */
const Settings = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBackupId, setLoadingBackupId] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);

  const loadBackups = async () => {
    try {
      const data = await getBackups(user.uid);
      setBackups(data);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
      addToast('Erro ao carregar backups', 'error');
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadBackups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backup = await createBackup(user.uid);
      await saveBackupToCloud(user.uid, backup);
      await loadBackups();

      addToast('Backup criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      addToast('Erro ao criar backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async backupId => {
    setLoadingBackupId(backupId);
    try {
      const backup = backups.find(b => b.id === backupId);
      if (backup) {
        downloadBackup(backup);
        addToast('Backup baixado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      addToast('Erro ao baixar backup', 'error');
    } finally {
      setLoadingBackupId(null);
    }
  };

  const handleRestoreBackup = async backupId => {
    if (
      !window.confirm('Tem certeza? Isso substituirá todos os dados atuais pelos dados do backup.')
    ) {
      return;
    }

    setLoadingBackupId(backupId);
    try {
      const backup = backups.find(b => b.id === backupId);
      if (backup) {
        await restoreBackup(user.uid, backup);
        addToast('Backup restaurado com sucesso! Recarregando...', 'success');

        // Recarregar página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      addToast('Erro ao restaurar backup', 'error');
      setLoadingBackupId(null);
    }
  };

  const getBackupSize = backup => {
    const collections = ['expenses', 'incomes', 'debts', 'goals', 'categories'];
    let totalItems = 0;

    collections.forEach(col => {
      if (backup.data && backup.data[col]) {
        totalItems += backup.data[col].length;
      }
    });

    return totalItems;
  };

  const handleExportCSV = async type => {
    setExportLoading(type);
    try {
      await exportToCSV(user.uid, type);
      addToast(
        `${type === 'expenses' ? 'Despesas' : type === 'debts' ? 'Dívidas' : type === 'incomes' ? 'Rendas' : 'Metas'} exportadas para CSV!`,
        'success'
      );
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      addToast(error.message || 'Erro ao exportar CSV', 'error');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading('excel');
    try {
      await exportToExcel(user.uid);
      addToast('Dados exportados para Excel!', 'success');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      addToast(error.message || 'Erro ao exportar Excel', 'error');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0 transition-colors duration-300">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">⚙️ Configurações</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus backups e configurações
          </p>
        </div>

        {/* Seção de Backup */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div style={{ padding: '2rem' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💾</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Backup de Dados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crie backups manuais dos seus dados
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Como funciona:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      <span>Backups incluem: despesas, rendas, dívidas, metas e categorias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      <span>Backups são salvos automaticamente na nuvem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      <span>Mantemos apenas os 5 backups mais recentes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      <span>Você pode baixar backups como arquivo JSON</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={handleCreateBackup} loading={loading} className="mb-6">
              {loading ? 'Criando Backup...' : '💾 Criar Backup Agora'}
            </Button>

            {/* Lista de Backups */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Backups Disponíveis:
              </h4>

              {backups.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📦</span>
                  <p className="text-gray-600 dark:text-gray-400">Nenhum backup disponível ainda</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Crie seu primeiro backup clicando no botão acima
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map(backup => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">💾</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatDate(backup.createdAt)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getBackupSize(backup)} itens • Versão {backup.version}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.id)}
                          disabled={loadingBackupId === backup.id}
                          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingBackupId === backup.id ? '⏳' : '⬇️'} Download
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={loadingBackupId === backup.id}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600"
                        >
                          {loadingBackupId === backup.id ? '⏳' : '↩️'} Restaurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Exportação */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div style={{ padding: '2rem' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📤</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Exportar Dados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exporte seus dados para CSV ou Excel
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    Formatos disponíveis:
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span>
                      <span>
                        CSV: Exporta cada tipo de dado individualmente (despesas, dívidas, rendas,
                        metas)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span>
                      <span>
                        Excel: Exporta todos os dados em um único arquivo com múltiplas abas
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span>
                      <span>
                        Arquivos podem ser abertos no Excel, Google Sheets ou qualquer editor de
                        planilhas
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Exportar CSV individual */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Exportar para CSV:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => handleExportCSV('expenses')}
                  disabled={exportLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 dark:border-blue-800"
                >
                  {exportLoading === 'expenses' ? '⏳' : '💸'} Despesas
                </button>
                <button
                  onClick={() => handleExportCSV('incomes')}
                  disabled={exportLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-green-200 dark:border-green-800"
                >
                  {exportLoading === 'incomes' ? '⏳' : '💰'} Rendas
                </button>
                <button
                  onClick={() => handleExportCSV('debts')}
                  disabled={exportLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 dark:border-red-800"
                >
                  {exportLoading === 'debts' ? '⏳' : '🔴'} Dívidas
                </button>
                <button
                  onClick={() => handleExportCSV('goals')}
                  disabled={exportLoading !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-purple-200 dark:border-purple-800"
                >
                  {exportLoading === 'goals' ? '⏳' : '🎯'} Metas
                </button>
              </div>
            </div>

            {/* Exportar Excel completo */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Exportar tudo para Excel:
              </h4>
              <Button
                onClick={handleExportExcel}
                loading={exportLoading === 'excel'}
                variant="primary"
              >
                {exportLoading === 'excel' ? 'Exportando...' : '📊 Exportar para Excel'}
              </Button>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Importante:
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Restaurar um backup substituirá <strong>todos os seus dados atuais</strong>. Faça
                isso apenas se tiver certeza. Recomendamos criar um backup antes de restaurar outro.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
