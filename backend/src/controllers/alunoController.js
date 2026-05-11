import { calcularRisco } from "../utils/calculadoraRisco.js";
import { listarAlunos, buscarAlunoPorId } from "../repositories/alunoRepository.js";

export async function listar(req, res) {
  try {
    const filtros = { turma_id: req.query.turma_id };
    const alunos = await listarAlunos(filtros);
    const alunosComSituacao = alunos.map((a) => ({
      ...a,
      ...calcularRisco(parseFloat(a.media_geral) || 0, parseFloat(a.frequencia_media) || 0),
    }));
    return res.json(alunosComSituacao);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function listarRisco(req, res) {
  try {
    const filtros = { turma_id: req.query.turma_id };
    const alunos = await listarAlunos(filtros);
    const emRisco = alunos
      .map((a) => ({
        ...a,
        ...calcularRisco(parseFloat(a.media_geral) || 0, parseFloat(a.frequencia_media) || 0),
      }))
      .filter((a) => a.situacao === "Risco" || a.situacao === "Atenção");
    return res.json(emRisco);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function detalhe(req, res) {
  try {
    const aluno = await buscarAlunoPorId(req.params.id);
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });
    const situacao = calcularRisco(parseFloat(aluno.media_geral) || 0, parseFloat(aluno.frequencia_media) || 0);
    return res.json({ ...aluno, ...situacao });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
