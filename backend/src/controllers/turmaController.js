import { listarTurmas, buscarTurmaPorId } from "../repositories/turmaRepository.js";

export async function listar(req, res) {
  try {
    const filtros = { ano_letivo: req.query.ano_letivo };
    const turmas = await listarTurmas(filtros);
    return res.json(turmas);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function detalhe(req, res) {
  try {
    const turma = await buscarTurmaPorId(req.params.id);
    if (!turma) return res.status(404).json({ erro: "Turma não encontrada" });
    return res.json(turma);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
