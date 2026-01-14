/**
 * File Parser Service
 * Serviço para parsear arquivos OFX e CSV de extratos bancários
 */

import { Banking } from 'ofx-js';
import Papa from 'papaparse';

/**
 * Converte data OFX (YYYYMMDD ou YYYYMMDDHHmmss) para objeto Date
 * @param {string} ofxDate - Data no formato OFX
 * @returns {Date} Objeto Date
 */
function parseOFXDate(ofxDate) {
  if (!ofxDate) return null;

  // Remove parte de hora se existir (YYYYMMDDHHmmss -> YYYYMMDD)
  const dateStr = ofxDate.toString().substring(0, 8);

  // Extrai ano, mês e dia
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  return new Date(`${year}-${month}-${day}`);
}

/**
 * Determina o tipo de transação baseado no valor
 * @param {number} amount - Valor da transação
 * @returns {string} 'income' ou 'expense'
 */
function getTransactionType(amount) {
  return amount >= 0 ? 'income' : 'expense';
}

/**
 * Parseia valor monetário de diferentes formatos
 * @param {string|number} value - Valor a ser parseado
 * @returns {number} Valor numérico
 */
function parseAmount(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove símbolos de moeda e espaços
  let cleaned = value.toString().replace(/[R$\s]/g, '');

  // Detectar formato brasileiro (1.234,56) vs americano (1,234.56)
  const hasDotBeforeComma = cleaned.indexOf('.') < cleaned.lastIndexOf(',');

  if (hasDotBeforeComma) {
    // Formato brasileiro: remove pontos e troca vírgula por ponto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Formato americano: remove vírgulas
    cleaned = cleaned.replace(/,/g, '');
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Parseia data de diferentes formatos
 * @param {string} value - Data a ser parseada
 * @returns {Date|null} Objeto Date ou null
 */
function parseDate(value) {
  if (!value) return null;

  const str = value.toString().trim();

  // Formato DD/MM/YYYY
  const ddmmyyyyMatch = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  // Formato DD-MM-YYYY
  const ddmmyyyyDashMatch = str.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  // Formato YYYY-MM-DD
  const yyyymmddMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    return new Date(`${year}-${month}-${day}`);
  }

  // Formato DD/MM/YY
  const ddmmyyMatch = str.match(/(\d{2})\/(\d{2})\/(\d{2})/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return new Date(`${fullYear}-${month}-${day}`);
  }

  // Tentar parsing padrão
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Parseia arquivo OFX e extrai transações
 * @param {string} fileContent - Conteúdo do arquivo OFX
 * @returns {Array} Array de transações
 * @throws {Error} Se houver erro ao parsear o arquivo
 */
export async function parseOFX(fileContent) {
  try {
    // Parseia o conteúdo OFX
    const ofxData = Banking.parse(fileContent);

    // Array para armazenar transações
    const transactions = [];

    // Verifica se há dados bancários
    if (!ofxData || !ofxData.BANKMSGSRSV1) {
      throw new Error('Arquivo OFX inválido: estrutura BANKMSGSRSV1 não encontrada');
    }

    // Obtém as respostas de extrato
    const stmtResponses = ofxData.BANKMSGSRSV1.STMTTRNRS;

    if (!stmtResponses || stmtResponses.length === 0) {
      throw new Error('Nenhuma transação encontrada no arquivo OFX');
    }

    // Itera sobre cada resposta de extrato
    stmtResponses.forEach(response => {
      if (!response.STMTRS || !response.STMTRS.BANKTRANLIST) {
        return;
      }

      const tranList = response.STMTRS.BANKTRANLIST.STMTTRN;

      if (!tranList || tranList.length === 0) {
        return;
      }

      // Processa cada transação
      tranList.forEach(tran => {
        const amount = parseFloat(tran.TRNAMT) || 0;

        // Cria objeto de transação padronizado
        const transaction = {
          id: tran.FITID || `${Date.now()}-${Math.random()}`, // ID único da transação
          date: parseOFXDate(tran.DTPOSTED), // Data da transação
          description: tran.MEMO || tran.NAME || 'Sem descrição', // Descrição
          amount: Math.abs(amount), // Valor absoluto
          type: getTransactionType(amount), // Tipo: income ou expense
          originalType: tran.TRNTYPE, // Tipo original do OFX (DEBIT, CREDIT, etc.)
          category: '', // Categoria vazia - usuário vai mapear depois
          rawData: tran, // Dados originais para referência
        };

        transactions.push(transaction);
      });
    });

    // Ordena transações por data (mais recente primeiro)
    transactions.sort((a, b) => b.date - a.date);

    return {
      success: true,
      transactions,
      totalTransactions: transactions.length,
      source: 'OFX',
    };
  } catch (error) {
    console.error('Erro ao parsear OFX:', error);
    throw new Error(`Erro ao processar arquivo OFX: ${error.message}`);
  }
}

/**
 * Verifica se os headers correspondem aos esperados
 * @param {Array<string>} actual - Headers reais do CSV
 * @param {Array<string>} expected - Headers esperados
 * @returns {boolean} true se correspondem
 */
function headersMatch(actual, expected) {
  return expected.every(header => actual.some(h => h.toLowerCase().includes(header.toLowerCase())));
}

/**
 * Detecta formato do CSV baseado nos headers
 * @param {Array<string>} headers - Headers do CSV
 * @returns {string} Formato detectado: 'nubank', 'itau', 'bradesco', 'generic'
 */
export function detectCSVFormat(headers) {
  const formats = {
    nubank: ['date', 'category', 'title', 'amount'],
    itau: ['data', 'lancamento', 'valor'],
    bradesco: ['data', 'historico', 'valor'],
  };

  // Tentar identificar banco pelo nome das colunas
  for (const [bank, expectedHeaders] of Object.entries(formats)) {
    if (headersMatch(headers, expectedHeaders)) {
      return bank;
    }
  }

  return 'generic';
}

/**
 * Mapeia dados CSV para transações baseado no formato
 * @param {Array<Object>} data - Dados do CSV
 * @param {string} format - Formato detectado
 * @param {Object} mapping - Mapeamento customizado (para formato generic)
 * @returns {Array<Object>} Array de transações
 */
export function mapCSVToTransactions(data, format, mapping = null) {
  const transactions = [];

  data.forEach((row, index) => {
    let transaction;

    switch (format) {
      case 'nubank':
        transaction = {
          id: `csv-${Date.now()}-${index}`,
          date: parseDate(row.date),
          description: row.title || 'Sem descrição',
          amount: Math.abs(parseAmount(row.amount)),
          type: parseAmount(row.amount) >= 0 ? 'income' : 'expense',
          category: row.category || '',
          rawData: row,
        };
        break;

      case 'itau':
        transaction = {
          id: `csv-${Date.now()}-${index}`,
          date: parseDate(row.data),
          description: row.lancamento || 'Sem descrição',
          amount: Math.abs(parseAmount(row.valor)),
          type: parseAmount(row.valor) >= 0 ? 'income' : 'expense',
          category: '',
          rawData: row,
        };
        break;

      case 'bradesco':
        transaction = {
          id: `csv-${Date.now()}-${index}`,
          date: parseDate(row.Data || row.data),
          description: row.Historico || row.historico || 'Sem descrição',
          amount: Math.abs(parseAmount(row.Valor || row.valor)),
          type: parseAmount(row.Valor || row.valor) >= 0 ? 'income' : 'expense',
          category: '',
          rawData: row,
        };
        break;

      case 'generic':
        if (!mapping) {
          console.warn('Formato generic requer mapeamento customizado');
          return;
        }
        const amountValue = parseAmount(row[mapping.amountColumn]);
        transaction = {
          id: `csv-${Date.now()}-${index}`,
          date: parseDate(row[mapping.dateColumn]),
          description: row[mapping.descriptionColumn] || 'Sem descrição',
          amount: Math.abs(amountValue),
          type: amountValue >= 0 ? 'income' : 'expense',
          category: mapping.categoryColumn ? row[mapping.categoryColumn] || '' : '',
          rawData: row,
        };
        break;

      default:
        console.warn(`Formato desconhecido: ${format}`);
        return;
    }

    // Valida se a transação tem dados mínimos
    if (transaction && transaction.date && transaction.description) {
      transactions.push(transaction);
    }
  });

  // Ordena transações por data (mais recente primeiro)
  transactions.sort((a, b) => b.date - a.date);

  return transactions;
}

/**
 * Parseia arquivo CSV e extrai transações
 * @param {string} fileContent - Conteúdo do arquivo CSV
 * @returns {Promise<Object>} Resultado do parsing com transações
 */
export async function parseCSV(fileContent) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      delimiter: '', // Auto-detecta vírgula ou ponto-e-vírgula
      complete: results => {
        try {
          const headers = results.meta.fields || [];
          const data = results.data || [];

          if (headers.length === 0) {
            reject(new Error('CSV sem headers. Verifique o formato do arquivo.'));
            return;
          }

          if (data.length === 0) {
            reject(new Error('CSV vazio. Nenhuma transação encontrada.'));
            return;
          }

          // Detecta formato automaticamente
          const format = detectCSVFormat(headers);

          // Se for formato genérico, retorna dados brutos para mapeamento manual
          if (format === 'generic') {
            resolve({
              success: true,
              headers,
              data,
              format,
              requiresMapping: true,
              totalRows: data.length,
              source: 'CSV',
            });
            return;
          }

          // Mapeia automaticamente para formatos conhecidos
          const transactions = mapCSVToTransactions(data, format);

          resolve({
            success: true,
            transactions,
            headers,
            format,
            requiresMapping: false,
            totalTransactions: transactions.length,
            source: 'CSV',
          });
        } catch (error) {
          reject(new Error(`Erro ao processar CSV: ${error.message}`));
        }
      },
      error: error => {
        reject(new Error(`Erro ao parsear CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Detecta o tipo de arquivo baseado no conteúdo
 * @param {string} content - Conteúdo do arquivo
 * @returns {string} 'OFX', 'CSV' ou 'UNKNOWN'
 */
export function detectFileType(content) {
  // Remove espaços em branco do início
  const trimmed = content.trim();

  // Verifica se é OFX (começa com tag SGML ou XML)
  if (
    trimmed.startsWith('<?xml') ||
    trimmed.startsWith('<OFX>') ||
    trimmed.startsWith('OFXHEADER:') ||
    trimmed.includes('<OFX>')
  ) {
    return 'OFX';
  }

  // Verifica se parece CSV (tem vírgulas ou ponto-e-vírgula nas primeiras linhas)
  const firstLines = trimmed.split('\n').slice(0, 3).join('\n');
  if (firstLines.includes(',') || firstLines.includes(';')) {
    return 'CSV';
  }

  return 'UNKNOWN';
}

/**
 * Parseia arquivo baseado no tipo detectado
 * @param {File} file - Arquivo a ser parseado
 * @returns {Promise<Object>} Resultado do parsing com transações
 */
export async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async e => {
      try {
        const content = e.target.result;
        const fileType = detectFileType(content);

        let result;

        switch (fileType) {
          case 'OFX':
            result = await parseOFX(content);
            break;

          case 'CSV':
            result = await parseCSV(content);
            break;

          default:
            reject(
              new Error(
                'Formato de arquivo não reconhecido. Apenas arquivos OFX e CSV são suportados.'
              )
            );
            return;
        }

        resolve({
          ...result,
          fileName: file.name,
          fileSize: file.size,
          fileType,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file);
  });
}

export default {
  parseOFX,
  parseCSV,
  parseFile,
  detectFileType,
  detectCSVFormat,
  mapCSVToTransactions,
  parseAmount,
  parseDate,
};
