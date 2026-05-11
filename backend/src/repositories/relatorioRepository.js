// Repository de relatórios: queries para exportação de dados
import { pool } from "../db.js";

export async function buscarAlunosParaExportacao(filtros = {}) {
  const { turma_id } = filtros;
  const params = [];
  let where = "WHERE a.ativo = TRUE";

  if (turma_id) {
    params.push(turma_id);
    where += ` AND a.turma_id = $${params.length}`;
  }

  const result = await pool.query(`
    SELECT
      a.nome,
      a.matricula,
      t.nome AS turma,
      ROUND(AVG(n.nota)::numeric, 2) AS media_geral,
      ROUND(AVG(f.percentual_frequencia)::numeric, 2) AS frequencia
    FROM alunos a
    LEFT JOIN turmas t ON t.id = a.turma_id
    LEFT JOIN notas n ON n.aluno_id = a.id
    LEFT JOIN frequencias f ON f.aluno_id = a.id
    ${where}
    GROUP BY a.id, a.nome, a.matricula, t.nome
    ORDER BY a.nome
  `, params);

  return result.rows;
}
