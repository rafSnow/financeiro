/**
 * Mappings Service
 * Gerencia mapeamentos customizados de colunas CSV
 */

/**
 * Salva mapeamento customizado no localStorage
 * @param {string} userId - ID do usuário
 * @param {string} bankName - Nome do banco/formato
 * @param {Object} mapping - Objeto de mapeamento
 */
export const saveMapping = (userId, bankName, mapping) => {
  try {
    const key = `mapping_${userId}_${bankName}`;
    localStorage.setItem(key, JSON.stringify(mapping));
    return true;
  } catch (error) {
    console.error('Erro ao salvar mapeamento:', error);
    return false;
  }
};

/**
 * Recupera mapeamento customizado do localStorage
 * @param {string} userId - ID do usuário
 * @param {string} bankName - Nome do banco/formato
 * @returns {Object|null} Objeto de mapeamento ou null
 */
export const getMapping = (userId, bankName) => {
  try {
    const key = `mapping_${userId}_${bankName}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao recuperar mapeamento:', error);
    return null;
  }
};

/**
 * Lista todos os mapeamentos salvos para um usuário
 * @param {string} userId - ID do usuário
 * @returns {Array} Array de objetos {bankName, mapping}
 */
export const listMappings = userId => {
  try {
    const mappings = [];
    const prefix = `mapping_${userId}_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const bankName = key.replace(prefix, '');
        const mapping = JSON.parse(localStorage.getItem(key));
        mappings.push({ bankName, mapping });
      }
    }

    return mappings;
  } catch (error) {
    console.error('Erro ao listar mapeamentos:', error);
    return [];
  }
};

/**
 * Remove mapeamento customizado
 * @param {string} userId - ID do usuário
 * @param {string} bankName - Nome do banco/formato
 * @returns {boolean} true se removido com sucesso
 */
export const deleteMapping = (userId, bankName) => {
  try {
    const key = `mapping_${userId}_${bankName}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover mapeamento:', error);
    return false;
  }
};

/**
 * Valida se um mapeamento tem os campos obrigatórios
 * @param {Object} mapping - Objeto de mapeamento
 * @returns {boolean} true se válido
 */
export const validateMapping = mapping => {
  if (!mapping) return false;

  const required = ['dateColumn', 'descriptionColumn', 'amountColumn'];
  return required.every(field => mapping[field] && mapping[field].trim() !== '');
};

export default {
  saveMapping,
  getMapping,
  listMappings,
  deleteMapping,
  validateMapping,
};
