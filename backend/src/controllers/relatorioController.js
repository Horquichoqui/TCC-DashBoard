import { calcularRisco } from "../utils/calculadoraRisco.js";
import { buscarAlunosParaExportacao } from "../repositories/relatorioRepository.js";
import { gerarCSV } from "../utils/csv.js";

export async function exportarAlunosRisco(req, res) {
  try {
    const filtros = { turma_id: req.query.turma_id };
    const alunos = await buscarAlunosParaExportacao(filtros);

    const alunosComSituacao = alunos
      .map((a) => ({
        ...a,
        ...calcularRisco(parseFloat(a.media_geral) || 0, parseFloat(a.frequencia) || 0),
      }))
      .filter((a) => a.situacao === "Risco" || a.situacao === "Atenção");

    const cabecalho = ["nome", "matricula", "turma", "media_geral", "frequencia", "situacao", "motivo"];
    const linhas = alunosComSituacao.map((a) => [
      a.nome, a.matricula, a.turma, a.media_geral, a.frequencia, a.situacao, a.motivo,
    ]);

    const csv = gerarCSV(cabecalho, linhas);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="alunos_em_risco.csv"');
    return res.send("﻿" + csv); // BOM para Excel reconhecer UTF-8
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
