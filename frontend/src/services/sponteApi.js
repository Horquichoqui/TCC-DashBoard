import api from './api';

/**
 * Serviço para comunicação com a integração Sponte no backend
 * Usa Axios com autenticação JWT automática
 */

export const sponteApi = {
  /**
   * Obter status da integração
   */
  getStatus: async () => {
    try {
      const response = await api.get('/sponte/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status do Sponte:', error);
      throw error;
    }
  },

  /**
   * Salvar configuração (CodigoCliente e Token)
   */
  saveConfig: async (codigoCliente, token, modoMock = true) => {
    try {
      const response = await api.post('/sponte/configuracao', {
        codigoCliente,
        token,
        modoMock,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  },

  /**
   * Testar conexão com Sponte
   */
  testConnection: async () => {
    try {
      const response = await api.post('/sponte/testar-conexao');
      return response.data;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      throw error;
    }
  },

  /**
   * Sincronizar turmas
   */
  syncTurmas: async () => {
    try {
      const response = await api.post('/sponte/sincronizar/turmas');
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar turmas:', error);
      throw error;
    }
  },

  /**
   * Sincronizar alunos
   */
  syncAlunos: async () => {
    try {
      const response = await api.post('/sponte/sincronizar/alunos');
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar alunos:', error);
      throw error;
    }
  },

  /**
   * Sincronizar boletins (notas e frequências)
   */
  syncBoletins: async () => {
    try {
      const response = await api.post('/sponte/sincronizar/boletins');
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar boletins:', error);
      throw error;
    }
  },

  /**
   * Sincronizar tudo (turmas, alunos e boletins)
   */
  syncCompleta: async () => {
    try {
      const response = await api.post('/sponte/sincronizar/completa');
      return response.data;
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      throw error;
    }
  },

  /**
   * Obter logs de sincronização
   */
  getLogs: async (limite = 50) => {
    try {
      const response = await api.get('/sponte/logs', {
        params: { limite },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      throw error;
    }
  },
};

export default sponteApi;
