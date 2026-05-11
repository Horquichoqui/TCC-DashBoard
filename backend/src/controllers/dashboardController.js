import { calcularRisco } from "../utils/calculadoraRisco.js";
import {
  buscarResumo,
  buscarRiscoPorTurma,
  buscarEvolucaoDesempenho,
  buscarFrequenciaPorTurma,
  buscarDistribuicaoSituacao,
} from "../repositories/dashboardRepository.js";

export async function resumo(req, res) {
  try {
    const filtros = { ano_letivo: req.query.ano_letivo, turma_id: req.query.turma_id };
    const data = await buscarResumo(filtros);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function riscoPorTurma(req, res) {
  try {
    const data = await buscarRiscoPorTurma();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function evolucaoDesempenho(req, res) {
  try {
    const data = await buscarEvolucaoDesempenho();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function frequenciaPorTurma(req, res) {
  try {
    const data = await buscarFrequenciaPorTurma();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function distribuicaoSituacao(req, res) {
  try {
    const alunos = await buscarDistribuicaoSituacao();
    const contagem = { Regular: 0, "Atenção": 0, Risco: 0 };
    for (const a of alunos) {
      const { situacao } = calcularRisco(parseFloat(a.media) || 0, parseFloat(a.frequencia) || 0);
      contagem[situacao] = (contagem[situacao] || 0) + 1;
    }
    return res.json(contagem);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
