import soap from "soap";
import { decrypt } from "../utils/crypto.js";
import * as mockData from "./sponteMockData.js";

// Cache do cliente SOAP para evitar recriações
let cachedClient = null;
let lastConfig = null;

/**
 * Criar cliente SOAP para a API Sponte
 * Usa WSDL oficial: https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL
 */
export async function createSponteClient(config) {
  try {
    const options = {
      timeout: 30000,
      connectionTimeout: 30000,
      httpClient: {
        timeout: 30000,
      },
    };

    const client = await soap.createClientAsync(config.endpoint, options);
    return client;
  } catch (error) {
    throw new Error(`Erro ao criar cliente SOAP Sponte: ${error.message}`);
  }
}

/**
 * Montar payload para GetTurmas
 * Todos os campos devem estar presentes (mesmo opcionais podem ser vazios)
 */
function montarPayloadGetTurmas({ codigoCliente, token, filtros = "" }) {
  return {
    CodigoCliente: codigoCliente,
    Token: token,
    ParametrosBusca: filtros || "",
  };
}

/**
 * Montar payload para GetAlunos
 */
function montarPayloadGetAlunos({ codigoCliente, token, filtros = "" }) {
  return {
    CodigoCliente: codigoCliente,
    Token: token,
    ParametrosBusca: filtros || "",
  };
}

/**
 * Montar payload para GetIntegrantesTurmas
 */
function montarPayloadGetIntegrantesTurmas({
  codigoCliente,
  token,
  turmaId = 0,
}) {
  return {
    CodigoCliente: codigoCliente,
    Token: token,
    TurmaID: turmaId || 0,
  };
}

/**
 * Montar payload para GetBoletim3
 * Retorna notas e frequência por aluno/turma/disciplina
 */
function montarPayloadGetBoletim3({
  codigoCliente,
  token,
  alunoId = 0,
  turmaId = 0,
  disciplinaId = 0,
  modulo = 0,
}) {
  return {
    CodigoCliente: codigoCliente,
    Token: token,
    AlunoID: alunoId || 0,
    TurmaID: turmaId || 0,
    DisciplinaID: disciplinaId || 0,
    Modulo: modulo || 0,
  };
}

/**
 * Chamar método genérico do Sponte
 * Abstrai a lógica de modo mock vs real
 */
export async function callSponteMethod(methodName, payload, config) {
  try {
    // Se está em modo mock ou sem credenciais, retorna dados fictícios
    if (config.modo_mock || !config.codigo_cliente || !config.token_criptografado) {
      return getMockData(methodName, payload);
    }

    // Se em modo real, chamar API Sponte
    // Descriptografar token apenas no backend
    const tokenDescriptografado = decrypt(config.token_criptografado);

    // Criar client SOAP
    const client = await createSponteClient(config);

    // Montar payload com CodigoCliente e Token
    const payloadComCredenciais = {
      ...payload,
      CodigoCliente: config.codigo_cliente,
      Token: tokenDescriptografado,
    };

    // Chamar método SOAP
    // IMPORTANTE: O método deve existir no WSDL do Sponte
    const result = await new Promise((resolve, reject) => {
      client[methodName](payloadComCredenciais, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao chamar método ${methodName} do Sponte: ${error.message}`
    );
  }
}

/**
 * Retornar dados fictícios baseado no método solicitado
 */
function getMockData(methodName, payload) {
  switch (methodName) {
    case "GetTurmas":
    case "GetTurmas2":
      return { GetTurmasResult: mockData.mockTurmas };

    case "GetAlunos":
    case "GetAlunos4":
      return { GetAlunosResult: mockData.mockAlunos };

    case "GetIntegrantesTurmas":
      const turmaId = payload?.TurmaID;
      const integrantes = mockData.mockIntegrantes.filter(
        (i) => i.TurmaID === turmaId
      );
      return { GetIntegrantesTurmasResult: integrantes };

    case "GetBoletim3":
      const boletim = mockData.mockBoletins.find(
        (b) =>
          b.AlunoID === payload?.AlunoID && b.TurmaID === payload?.TurmaID
      );
      return boletim || { AlunoID: payload?.AlunoID, TurmaID: payload?.TurmaID, ListaNotasBoletim: [] };

    default:
      return {};
  }
}

/**
 * Métodos públicos para cada operação do Sponte
 */

export async function getTurmas(config, filtros = "") {
  const payload = montarPayloadGetTurmas({
    codigoCliente: config.codigo_cliente,
    token: config.token_criptografado,
    filtros,
  });
  return callSponteMethod("GetTurmas2", payload, config);
}

export async function getAlunos(config, filtros = "") {
  const payload = montarPayloadGetAlunos({
    codigoCliente: config.codigo_cliente,
    token: config.token_criptografado,
    filtros,
  });
  return callSponteMethod("GetAlunos4", payload, config);
}

export async function getIntegrantesTurmas(config, turmaId) {
  const payload = montarPayloadGetIntegrantesTurmas({
    codigoCliente: config.codigo_cliente,
    token: config.token_criptografado,
    turmaId,
  });
  return callSponteMethod("GetIntegrantesTurmas", payload, config);
}

export async function getBoletim3(config, alunoId, turmaId, disciplinaId = 0, modulo = 0) {
  const payload = montarPayloadGetBoletim3({
    codigoCliente: config.codigo_cliente,
    token: config.token_criptografado,
    alunoId,
    turmaId,
    disciplinaId,
    modulo,
  });
  return callSponteMethod("GetBoletim3", payload, config);
}

export default {
  createSponteClient,
  callSponteMethod,
  getTurmas,
  getAlunos,
  getIntegrantesTurmas,
  getBoletim3,
};
