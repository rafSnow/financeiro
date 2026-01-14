import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileDropZone from '../components/FileDropZone';
import Header from '../components/Header';
import ImportPreview from '../components/ImportPreview';
import Modal from '../components/Modal';
import { createExpense } from '../services/expenses.service';
import { parseFile } from '../services/fileParser.service';
import { createIncome } from '../services/income.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

/**
 * Página de importação de extratos
 * Permite upload de arquivos OFX e CSV
 */
const Import = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async file => {
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const result = await parseFile(file);

      if (result.requiresMapping) {
        // TODO: Implementar mapeamento customizado no Dia 6-7
        addToast(
          'CSV genérico detectado. Mapeamento customizado será implementado em breve.',
          'info'
        );
        setLoading(false);
        return;
      }

      setParsedData(result);
      setShowPreview(true);
      addToast(
        `${result.transactions.length} transações encontradas em ${result.fileType}`,
        'success'
      );
    } catch (error) {
      console.error('Erro ao parsear arquivo:', error);
      addToast(error.message || 'Erro ao processar arquivo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async selectedTransactions => {
    if (!selectedTransactions || selectedTransactions.length === 0) {
      addToast('Nenhuma transação selecionada', 'error');
      return;
    }

    setLoading(true);

    try {
      let importedCount = 0;
      let errorCount = 0;

      for (const transaction of selectedTransactions) {
        try {
          const data = {
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            category: transaction.category || 'Outros',
            userId: user.uid,
          };

          if (transaction.type === 'expense') {
            await createExpense(data);
          } else {
            await createIncome(data);
          }

          importedCount++;
        } catch (error) {
          console.error('Erro ao importar transação:', error);
          errorCount++;
        }
      }

      if (importedCount > 0) {
        addToast(
          `${importedCount} transação(ões) importada(s) com sucesso!`,
          'success'
        );
      }

      if (errorCount > 0) {
        addToast(
          `${errorCount} transação(ões) falharam ao importar`,
          'error'
        );
      }

      // Limpar estado e redirecionar
      setParsedData(null);
      setShowPreview(false);
      setFileName('');

      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erro ao importar transações:', error);
      addToast('Erro ao importar transações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setParsedData(null);
    setShowPreview(false);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              📥 Importar Extrato
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Importe seus extratos bancários em formato OFX ou CSV
            </p>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              ℹ️ Formatos suportados:
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>
                <strong>OFX</strong>: Formato padrão de extratos bancários
              </li>
              <li>
                <strong>CSV</strong>: Suporta Nubank, Itaú, Bradesco e formatos genéricos
              </li>
            </ul>
          </div>

          {/* Upload Zone */}
          {!loading && !showPreview && (
            <FileDropZone onFileSelect={handleFileSelect} />
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {fileName ? `Processando ${fileName}...` : 'Processando arquivo...'}
              </p>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && parsedData && (
            <Modal isOpen={showPreview} onClose={handleCancelPreview}>
              <ImportPreview
                transactions={parsedData.transactions}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelPreview}
              />
            </Modal>
          )}

          {/* Instruções */}
          {!loading && !showPreview && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                📖 Como usar:
              </h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Baixe seu extrato bancário no formato OFX ou CSV</li>
                <li>Arraste o arquivo para a área acima ou clique para selecionar</li>
                <li>Revise as transações detectadas</li>
                <li>Selecione quais transações deseja importar</li>
                <li>Confirme a importação</li>
              </ol>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>⚠️ Atenção:</strong> O sistema detecta automaticamente duplicatas.
                  Transações já importadas não serão duplicadas.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Import;
