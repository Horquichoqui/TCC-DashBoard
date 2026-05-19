import * as sponteRepository from "../repositories/sponteRepository.js";
import * as sponteSyncService from "../services/sponteSyncService.js";
import * as sponteClient from "../services/sponteClient.js";
import { encrypt, decrypt } from "../utils/crypto.js";

/**
 * Obter status da integração Sponte
 */
export async function getStatus(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config) {
      return res.json({
        success: true,
        data: {
          configurado: false,
          modo: "demonstracao",
          ultimaSincronizacao: null,
          endpoint: "https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL",
          tokenConfigurado: false,
          aviso: "Enquanto as credenciais reais não forem informadas, o sistema usa dados fictícios para demonstração.",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        configurado: config.ativo && !!config.codigo_cliente,
        modo: config.modo_mock ? "demonstracao" : "real",
        ultimaSincronizacao: config.ultima_sincronizacao,
        endpoint: config.endpoint,
        tokenConfigurado: !!config.token_criptografado,
        aviso: config.modo_mock
          ? "Modo de demonstração ativo. O sistema usa dados fictícios."
          : "Modo real ativo. O sistema sincroniza com o Sponte.",
      },
    });
  } catch (erro) {
    console.error("Erro ao obter status:", erro);
    res.status(500).json({
      success: false,
      message: "Erro ao obter status da integração",
      error: erro.message,
    });
  }
}

/**
 * Salvar configuração do Sponte (CodigoCliente e Token)
 */
export async function salvarConfiguracao(req, res) {
  try {
    const { codigoCliente, token, modoMock = true } = req.body;

    // Validar entrada
    if (!codigoCliente || !token) {
      return res.status(400).json({
        success: false,
        message: "CodigoCliente e Token são obrigatórios",
      });
    }

    // Criptografar token antes de salvar
    const tokenCriptografado = encrypt(token);

    // Salvar no banco
    const config = await sponteRepository.salvarConfiguracaoSponte({
      codigoCliente,
      tokenCriptografado,
      endpoint: "https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL",
      modoMock,
      ativo: true,
    });

    // Registrar log
    await sponteRepository.criarLogSponte({
      tipo: "CONFIGURACAO",
      status: "SUCESSO",
      mensagem: `Configuração do Sponte salva com sucesso. Modo: ${modoMock ? "demonstração" : "real"}`,
    });

    return res.json({
      success: true,
      message: "Configuração salva com sucesso",
      data: {
        configurado: true,
        modo: modoMock ? "demonstracao" : "real",
      },
    });
  } catch (erro) {
    console.error("Erro ao salvar configuração:", erro);

    await sponteRepository.criarLogSponte({
      tipo: "CONFIGURACAO",
      status: "ERRO",
      mensagem: `Erro ao salvar: ${erro.message}`,
    });

    res.status(500).json({
      success: false,
      message: "Erro ao salvar configuração",
      error: erro.message,
    });
  }
}

/**
 * Testar conexão com o Sponte
 */
export async function testarConexao(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config?.codigo_cliente || !config?.token_criptografado) {
      return res.status(400).json({
        success: false,
        message: "Configuração não encontrada. Salve CodigoCliente e Token primeiro.",
      });
    }

    // Tentar chamar um método leve do Sponte
    const resultado = await sponteClient.getTurmas(config, "Situacao=-1;limit=1");

    if (resultado) {
      await sponteRepository.criarLogSponte({
        tipo: "TESTE_CONEXAO",
        status: "SUCESSO",
        mensagem: "Conexão com Sponte testada com sucesso",
      });

      return res.json({
        success: true,
        message: "Conexão com Sponte testada com sucesso",
        data: {
          conexao: "ok",
          modo: config.modo_mock ? "demonstracao" : "real",
        },
      });
    }
  } catch (erro) {
    console.error("Erro ao testar conexão:", erro);

    await sponteRepository.criarLogSponte({
      tipo: "TESTE_CONEXAO",
      status: "ERRO",
      mensagem: `Erro na conexão: ${erro.message}`,
    });

    return res.status(500).json({
      success: false,
      message: "Erro ao conectar com o Sponte",
      error: erro.message,
    });
  }
}

/**
 * Sincronizar turmas
 */
export async function sincronizarTurmas(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Sponte não configurado",
      });
    }

    const resultado = await sponteSyncService.sincronizarTurmas(config);

    return res.json({
      success: true,
      message: "Sincronização de turmas concluída",
      data: resultado,
    });
  } catch (erro) {
    console.error("Erro ao sincronizar turmas:", erro);
    res.status(500).json({
      success: false,
      message: "Erro ao sincronizar turmas",
      error: erro.message,
    });
  }
}

/**
 * Sincronizar alunos
 */
export async function sincronizarAlunos(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Sponte não configurado",
      });
    }

    const resultado = await sponteSyncService.sincronizarAlunos(config);

    return res.json({
      success: true,
      message: "Sincronização de alunos concluída",
      data: resultado,
    });
  } catch (erro) {
    console.error("Erro ao sincronizar alunos:", erro);
    res.status(500).json({
      success: false,
      message: "Erro ao sincronizar alunos",
      error: erro.message,
    });
  }
}

/**
 * Sincronizar boletins (notas e frequências)
 */
export async function sincronizarBoletins(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Sponte não configurado",
      });
    }

    const resultado = await sponteSyncService.sincronizarBoletins(config);

    return res.json({
      success: true,
      message: "Sincronização de boletins concluída",
      data: resultado,
    });
  } catch (erro) {
    console.error("Erro ao sincronizar boletins:", erro);
    res.status(500).json({
      success: false,
      message: "Erro ao sincronizar boletins",
      error: erro.message,
    });
  }
}

/**
 * Sincronização completa
 */
export async function sincronizarCompleta(req, res) {
  try {
    const config = await sponteRepository.getConfiguracaoSponte();

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Sponte não configurado",
      });
    }

    const resultado = await sponteSyncService.sincronizarCompleta(config);

    return res.json({
      success: true,
      message: "Sincronização completa concluída",
      data: resultado,
    });
  } catch (erro) {
    console.error("Erro na sincronização completa:", erro);
    res.status(500).json({
      success: false,
      message: "Erro na sincronização",
      error: erro.message,
    });
  }
}

/**
 * Listar logs de sincronização
 */
export async function listarLogs(req, res) {
  try {
    const limite = req.query.limite || 50;
    const logs = await sponteRepository.listarLogsSponte(limite);

    return res.json({
      success: true,
      data: logs,
    });
  } catch (erro) {
    console.error("Erro ao listar logs:", erro);
    res.status(500).json({
      success: false,
      message: "Erro ao listar logs",
      error: erro.message,
    });
  }
}

export default {
  getStatus,
  salvarConfiguracao,
  testarConexao,
  sincronizarTurmas,
  sincronizarAlunos,
  sincronizarBoletins,
  sincronizarCompleta,
  listarLogs,
};
