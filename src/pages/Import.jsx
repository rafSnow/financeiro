import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnMapper from '../components/ColumnMapper';
import FileDropZone from '../components/FileDropZone';
import Header from '../components/Header';
import ImportPreview from '../components/ImportPreview';
import Modal from '../components/Modal';
import { mapCSVToTransactions, parseFile } from '../services/fileParser.service';
import { db } from '../services/firebase';
import { saveMapping } from '../services/mappings.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { findDuplicates } from '../utils/duplicateDetection';

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
  const [showMapper, setShowMapper] = useState(false);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = async file => {
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const result = await parseFile(file);

      if (result.requiresMapping) {
        // CSV genérico - mostrar mapeador
        setParsedData(result);
        setShowMapper(true);
        addToast('CSV genérico detectado. Configure o mapeamento de colunas.', 'info');
        setLoading(false);
        return;
      }

      // Detectar duplicatas
      const { duplicates, unique } = await findDuplicates(result.transactions, user.uid);

      // Marcar transações com flag isDuplicate
      const markedTransactions = result.transactions.map(transaction => {
        const isDuplicate = duplicates.some(
          dup =>
            dup.description === transaction.description &&
            dup.amount === transaction.amount &&
            new Date(dup.date).toISOString() === new Date(transaction.date).toISOString()
        );
        return { ...transaction, isDuplicate };
      });

      setParsedData({
        ...result,
        transactions: markedTransactions,
        duplicateCount: duplicates.length,
        uniqueCount: unique.length,
      });
      setShowPreview(true);

      if (duplicates.length > 0) {
        addToast(
          `${result.transactions.length} transações encontradas (${duplicates.length} duplicatas detectadas)`,
          'warning'
        );
      } else {
        addToast(
          `${result.transactions.length} transações encontradas em ${result.fileType}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Erro ao parsear arquivo:', error);
      addToast(error.message || 'Erro ao processar arquivo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validar transação antes de importar
  const validateTransaction = transaction => {
    const errors = [];

    // Validar descrição
    if (!transaction.description || transaction.description.trim() === '') {
      errors.push('Descrição vazia');
    }

    // Validar valor
    if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
      errors.push('Valor inválido');
    }

    if (transaction.amount === 0) {
      errors.push('Valor não pode ser zero');
    }

    // Validar data
    if (!transaction.date) {
      errors.push('Data ausente');
    } else {
      const date = new Date(transaction.date);
      if (isNaN(date.getTime())) {
        errors.push('Data inválida');
      }
    }

    // Validar tipo
    if (!transaction.type || !['expense', 'income'].includes(transaction.type)) {
      errors.push('Tipo inválido');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleConfirmImport = async selectedTransactions => {
    if (!selectedTransactions || selectedTransactions.length === 0) {
      addToast('Nenhuma transação selecionada', 'error');
      return;
    }

    setLoading(true);
    setImportProgress({ current: 0, total: selectedTransactions.length });

    try {
      // Validar todas as transações primeiro
      const validTransactions = [];
      const invalidTransactions = [];

      selectedTransactions.forEach((transaction, index) => {
        const validation = validateTransaction(transaction);
        if (validation.isValid) {
          validTransactions.push(transaction);
        } else {
          invalidTransactions.push({
            transaction,
            errors: validation.errors,
            index: index + 1,
          });
        }
      });

      // Mostrar erros de validação
      if (invalidTransactions.length > 0) {
        const errorMessage = `${invalidTransactions.length} transação(ões) inválida(s) foram ignoradas`;
        addToast(errorMessage, 'warning');
        console.warn('Transações inválidas:', invalidTransactions);
      }

      if (validTransactions.length === 0) {
        addToast('Nenhuma transação válida para importar', 'error');
        setLoading(false);
        setImportProgress({ current: 0, total: 0 });
        return;
      }

      // Usar writeBatch para importação eficiente
      // Firestore limita batches a 500 operações
      const BATCH_SIZE = 500;
      let importedCount = 0;

      for (let i = 0; i < validTransactions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchTransactions = validTransactions.slice(i, i + BATCH_SIZE);

        batchTransactions.forEach(transaction => {
          const collectionName = transaction.type === 'expense' ? 'expenses' : 'incomes';
          const docRef = doc(collection(db, collectionName));

          batch.set(docRef, {
            userId: user.uid,
            description: transaction.description.trim(),
            amount: Math.abs(transaction.amount),
            date: Timestamp.fromDate(new Date(transaction.date)),
            category: transaction.category || 'Outros',
            paymentMethod: 'imported',
            isFixed: false,
            createdAt: Timestamp.now(),
          });
        });

        await batch.commit();
        importedCount += batchTransactions.length;
        setImportProgress({ current: importedCount, total: validTransactions.length });
      }

      // Mensagem de sucesso
      addToast(`${importedCount} transação(ões) importada(s) com sucesso!`, 'success');

      // Limpar estado e redirecionar
      setParsedData(null);
      setShowPreview(false);
      setFileName('');
      setImportProgress({ current: 0, total: 0 });

      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erro ao importar transações:', error);
      addToast('Erro ao importar transações: ' + error.message, 'error');
      setImportProgress({ current: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setParsedData(null);
    setShowPreview(false);
    setFileName('');
  };

  const handleMappingComplete = async (mapping, mappingName) => {
    if (!parsedData || !parsedData.data) {
      addToast('Dados não encontrados', 'error');
      return;
    }

    try {
      // Aplicar mapeamento aos dados CSV
      const transactions = mapCSVToTransactions(parsedData.data, 'generic', mapping);

      // Salvar mapeamento se nome foi fornecido
      if (mappingName && mappingName.trim()) {
        saveMapping(user.uid, mappingName.trim(), mapping);
        addToast(`Mapeamento "${mappingName}" salvo com sucesso!`, 'success');
      }

      // Detectar duplicatas
      const { duplicates, unique } = await findDuplicates(transactions, user.uid);

      // Marcar transações com flag isDuplicate
      const markedTransactions = transactions.map(transaction => {
        const isDuplicate = duplicates.some(
          dup =>
            dup.description === transaction.description &&
            dup.amount === transaction.amount &&
            new Date(dup.date).toISOString() === new Date(transaction.date).toISOString()
        );
        return { ...transaction, isDuplicate };
      });

      // Atualizar parsedData com transações mapeadas
      setParsedData({
        ...parsedData,
        transactions: markedTransactions,
        requiresMapping: false,
        duplicateCount: duplicates.length,
        uniqueCount: unique.length,
      });

      // Fechar mapeador e abrir preview
      setShowMapper(false);
      setShowPreview(true);

      if (duplicates.length > 0) {
        addToast(
          `${transactions.length} transações mapeadas (${duplicates.length} duplicatas detectadas)`,
          'warning'
        );
      } else {
        addToast(`${transactions.length} transações mapeadas com sucesso!`, 'success');
      }
    } catch (error) {
      console.error('Erro ao aplicar mapeamento:', error);
      addToast('Erro ao aplicar mapeamento', 'error');
    }
  };

  const handleCancelMapper = () => {
    setParsedData(null);
    setShowMapper(false);
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
          {!loading && !showPreview && <FileDropZone onFileSelect={handleFileSelect} />}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {importProgress.total > 0
                  ? `Importando ${importProgress.current} de ${importProgress.total} transações...`
                  : fileName
                  ? `Processando ${fileName}...`
                  : 'Processando arquivo...'}
              </p>
              {importProgress.total > 0 && (
                <div className="w-64 mt-4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(importProgress.current / importProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {Math.round((importProgress.current / importProgress.total) * 100)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && parsedData && (
            <Modal isOpen={showPreview} onClose={handleCancelPreview} size="xl">
              <ImportPreview
                transactions={parsedData.transactions}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelPreview}
              />
            </Modal>
          )}

          {/* Mapper Modal */}
          {showMapper && parsedData && (
            <Modal isOpen={showMapper} onClose={handleCancelMapper} size="xl">
              <ColumnMapper
                headers={parsedData.headers}
                onMappingComplete={handleMappingComplete}
                onCancel={handleCancelMapper}
              />
            </Modal>
          )}

          {/* Instruções */}
          {!loading && !showPreview && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">📖 Como usar:</h3>
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
