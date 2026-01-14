/**
 * File Parser Service
 * Serviço para parsear arquivos OFX e CSV de extratos bancários
 */

import { Banking } from 'ofx-js';

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
    stmtResponses.forEach((response) => {
      if (!response.STMTRS || !response.STMTRS.BANKTRANLIST) {
        return;
      }
      
      const tranList = response.STMTRS.BANKTRANLIST.STMTTRN;
      
      if (!tranList || tranList.length === 0) {
        return;
      }
      
      // Processa cada transação
      tranList.forEach((tran) => {
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
          rawData: tran // Dados originais para referência
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
      source: 'OFX'
    };
    
  } catch (error) {
    console.error('Erro ao parsear OFX:', error);
    throw new Error(`Erro ao processar arquivo OFX: ${error.message}`);
  }
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
  if (trimmed.startsWith('<?xml') || 
      trimmed.startsWith('<OFX>') || 
      trimmed.startsWith('OFXHEADER:') ||
      trimmed.includes('<OFX>')) {
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
    
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const fileType = detectFileType(content);
        
        let result;
        
        switch (fileType) {
          case 'OFX':
            result = await parseOFX(content);
            break;
            
          case 'CSV':
            // TODO: Implementar parseCSV no Dia 3-4
            reject(new Error('Parser CSV ainda não implementado. Será adicionado no Dia 3-4.'));
            return;
            
          default:
            reject(new Error('Formato de arquivo não reconhecido. Apenas arquivos OFX são suportados no momento.'));
            return;
        }
        
        resolve({
          ...result,
          fileName: file.name,
          fileSize: file.size,
          fileType
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
  parseFile,
  detectFileType
};
