import pool from "../database/db.js";

/**
 * Obter configuração do Sponte
 */
export async function getConfiguracaoSponte() {
  try {
    const result = await pool.query(
      "SELECT * FROM sponte_configuracoes ORDER BY id DESC LIMIT 1"
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erro ao buscar configuracao do Sponte: ${error.message}`);
  }
}

/**
 * Salvar ou atualizar configuração do Sponte
 */
export async function salvarConfiguracaoSponte({
  codigoCliente,
  tokenCriptografado,
  endpoint = "https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL",
  modoMock = true,
  ativo = false,
}) {
  try {
    // Verificar se já existe configuração
    const existente = await getConfiguracaoSponte();

    if (existente) {
      // Atualizar
      const result = await pool.query(
        `UPDATE sponte_configuracoes
         SET codigo_cliente = $1,
             token_criptografado = $2,
             endpoint = $3,
             modo_mock = $4,
             ativo = $5,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [codigoCliente, tokenCriptografado, endpoint, modoMock, ativo, existente.id]
      );
      return result.rows[0];
    } else {
      // Inserir nova
      const result = await pool.query(
        `INSERT INTO sponte_configuracoes
         (codigo_cliente, token_criptografado, endpoint, modo_mock, ativo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [codigoCliente, tokenCriptografado, endpoint, modoMock, ativo]
      );
      return result.rows[0];
    }
  } catch (error) {
    throw new Error(
      `Erro ao salvar configuracao do Sponte: ${error.message}`
    );
  }
}

/**
 * Atualizar última sincronização
 */
export async function atualizarUltimaSincronizacao(id) {
  try {
    const result = await pool.query(
      `UPDATE sponte_configuracoes
       SET ultima_sincronizacao = CURRENT_TIMESTAMP, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(
      `Erro ao atualizar ultima sincronizacao: ${error.message}`
    );
  }
}

/**
 * Criar log de sincronização
 */
export async function criarLogSponte({
  tipo = "SYNC",
  status = "INFO",
  mensagem = "",
  detalhes = null,
}) {
  try {
    const result = await pool.query(
      `INSERT INTO sponte_logs (tipo, status, mensagem, detalhes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tipo, status, mensagem, detalhes ? JSON.stringify(detalhes) : null]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao criar log do Sponte: ${error.message}`);
  }
}

/**
 * Listar logs de sincronização
 */
export async function listarLogsSponte(limite = 50) {
  try {
    const result = await pool.query(
      `SELECT * FROM sponte_logs
       ORDER BY criado_em DESC
       LIMIT $1`,
      [limite]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Erro ao listar logs do Sponte: ${error.message}`);
  }
}

/**
 * Criar registro de sincronização
 */
export async function criarSincronizacao({
  entidade = "GERAL",
  status = "INICIADA",
}) {
  try {
    const result = await pool.query(
      `INSERT INTO sponte_sincronizacoes (entidade, status)
       VALUES ($1, $2)
       RETURNING *`,
      [entidade, status]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao criar sincronizacao: ${error.message}`);
  }
}

/**
 * Finalizar sincronização com estatísticas
 */
export async function finalizarSincronizacao({
  id,
  status = "CONCLUIDA",
  totalRecebido = 0,
  totalInserido = 0,
  totalAtualizado = 0,
  totalErros = 0,
  mensagem = "",
}) {
  try {
    const result = await pool.query(
      `UPDATE sponte_sincronizacoes
       SET status = $1,
           total_recebido = $2,
           total_inserido = $3,
           total_atualizado = $4,
           total_erros = $5,
           mensagem = $6,
           finalizado_em = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [status, totalRecebido, totalInserido, totalAtualizado, totalErros, mensagem, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao finalizar sincronizacao: ${error.message}`);
  }
}

/**
 * Salvar mapeamento entre ID Sponte e ID local
 */
export async function salvarMapeamento({
  entidade = "TURMA",
  sponteId,
  localId,
}) {
  try {
    const result = await pool.query(
      `INSERT INTO sponte_mapeamentos (entidade, sponte_id, local_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (entidade, sponte_id)
       DO UPDATE SET local_id = $3, atualizado_em = CURRENT_TIMESTAMP
       RETURNING *`,
      [entidade, sponteId, localId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao salvar mapeamento: ${error.message}`);
  }
}

/**
 * Buscar ID local a partir do ID Sponte
 */
export async function buscarMapeamento({ entidade = "TURMA", sponteId }) {
  try {
    const result = await pool.query(
      `SELECT * FROM sponte_mapeamentos
       WHERE entidade = $1 AND sponte_id = $2`,
      [entidade, sponteId]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erro ao buscar mapeamento: ${error.message}`);
  }
}

/**
 * Buscar ID Sponte a partir do ID local
 */
export async function buscarMapeamentoReverso({ entidade = "TURMA", localId }) {
  try {
    const result = await pool.query(
      `SELECT * FROM sponte_mapeamentos
       WHERE entidade = $1 AND local_id = $2`,
      [entidade, localId]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erro ao buscar mapeamento reverso: ${error.message}`);
  }
}

export default {
  getConfiguracaoSponte,
  salvarConfiguracaoSponte,
  atualizarUltimaSincronizacao,
  criarLogSponte,
  listarLogsSponte,
  criarSincronizacao,
  finalizarSincronizacao,
  salvarMapeamento,
  buscarMapeamento,
  buscarMapeamentoReverso,
};
