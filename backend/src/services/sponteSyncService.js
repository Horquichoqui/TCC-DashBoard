import pool from "../database/db.js";
import * as sponteClient from "./sponteClient.js";
import * as sponteRepository from "../repositories/sponteRepository.js";

/**
 * SERVIÇO DE SINCRONIZAÇÃO DO SPONTE
 *
 * Responsável por:
 * 1. Buscar dados do Sponte (real ou mock)
 * 2. Transformar dados para o formato do dashboard
 * 3. Salvar no banco de dados local
 * 4. Registrar logs e mapeamentos
 */

/**
 * Sincronizar turmas
 */
export async function sincronizarTurmas(config) {
  const sync = await sponteRepository.criarSincronizacao({
    entidade: "TURMAS",
    status: "INICIADA",
  });

  try {
    console.log("[Sponte] Sincronizando turmas...");

    // Buscar turmas do Sponte
    const resposta = await sponteClient.getTurmas(
      config,
      "Situacao=-1"
    );
    const turmas = resposta?.GetTurmasResult || [];

    let totalInserido = 0;
    let totalAtualizado = 0;
    let totalErros = 0;

    for (const turmaSponte of turmas) {
      try {
        // Verificar se turma já existe pelo mapeamento
        const mapeamento = await sponteRepository.buscarMapeamento({
          entidade: "TURMA",
          sponteId: turmaSponte.TurmaID,
        });

        let turmaLocal = null;

        if (mapeamento) {
          // Atualizar turma existente
          const result = await pool.query(
            `UPDATE turmas
             SET nome = $1, sigla = $2, turno = $3, atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [turmaSponte.Nome, turmaSponte.Sigla, turmaSponte.Turno, mapeamento.local_id]
          );
          turmaLocal = result.rows[0];
          totalAtualizado++;
        } else {
          // Inserir nova turma
          const result = await pool.query(
            `INSERT INTO turmas (nome, sigla, turno)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [turmaSponte.Nome, turmaSponte.Sigla, turmaSponte.Turno]
          );
          turmaLocal = result.rows[0];
          totalInserido++;

          // Salvar mapeamento
          await sponteRepository.salvarMapeamento({
            entidade: "TURMA",
            sponteId: turmaSponte.TurmaID,
            localId: turmaLocal.id,
          });
        }
      } catch (erro) {
        console.error(`Erro ao sincronizar turma ${turmaSponte.TurmaID}:`, erro);
        totalErros++;
      }
    }

    // Finalizar sincronização
    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "CONCLUIDA",
      totalRecebido: turmas.length,
      totalInserido,
      totalAtualizado,
      totalErros,
      mensagem: `${totalInserido} turmas inseridas, ${totalAtualizado} atualizadas`,
    });

    await sponteRepository.criarLogSponte({
      tipo: "TURMAS",
      status: "SUCESSO",
      mensagem: `Sincronização de turmas concluída: ${totalInserido} inseridas, ${totalAtualizado} atualizadas`,
    });

    return {
      sucesso: true,
      totalInserido,
      totalAtualizado,
      totalErros,
    };
  } catch (erro) {
    console.error("Erro ao sincronizar turmas:", erro);

    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "ERRO",
      mensagem: erro.message,
    });

    await sponteRepository.criarLogSponte({
      tipo: "TURMAS",
      status: "ERRO",
      mensagem: erro.message,
    });

    throw erro;
  }
}

/**
 * Sincronizar alunos
 */
export async function sincronizarAlunos(config) {
  const sync = await sponteRepository.criarSincronizacao({
    entidade: "ALUNOS",
    status: "INICIADA",
  });

  try {
    console.log("[Sponte] Sincronizando alunos...");

    // Buscar alunos do Sponte
    const resposta = await sponteClient.getAlunos(
      config,
      "SituacaoAlunoID=-1"
    );
    const alunos = resposta?.GetAlunosResult || [];

    let totalInserido = 0;
    let totalAtualizado = 0;
    let totalErros = 0;

    for (const alunoSponte of alunos) {
      try {
        // Buscar turma pelo nome
        let turmaId = null;
        if (alunoSponte.TurmaAtual) {
          const turmaResult = await pool.query(
            "SELECT id FROM turmas WHERE nome = $1 LIMIT 1",
            [alunoSponte.TurmaAtual]
          );
          turmaId = turmaResult.rows[0]?.id || null;
        }

        // Verificar se aluno já existe pelo número de matrícula
        const alunoExistente = await pool.query(
          "SELECT * FROM alunos WHERE numero_matricula = $1",
          [alunoSponte.NumeroMatricula]
        );

        let alunoLocal = null;

        if (alunoExistente.rows.length > 0) {
          // Atualizar aluno existente
          const result = await pool.query(
            `UPDATE alunos
             SET nome = $1, email = $2, turma_id = $3, atualizado_em = CURRENT_TIMESTAMP
             WHERE numero_matricula = $4
             RETURNING *`,
            [alunoSponte.Nome, alunoSponte.Email, turmaId, alunoSponte.NumeroMatricula]
          );
          alunoLocal = result.rows[0];
          totalAtualizado++;
        } else {
          // Inserir novo aluno
          const result = await pool.query(
            `INSERT INTO alunos (nome, numero_matricula, email, turma_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [alunoSponte.Nome, alunoSponte.NumeroMatricula, alunoSponte.Email, turmaId]
          );
          alunoLocal = result.rows[0];
          totalInserido++;
        }

        // Salvar mapeamento
        await sponteRepository.salvarMapeamento({
          entidade: "ALUNO",
          sponteId: alunoSponte.AlunoID,
          localId: alunoLocal.id,
        });
      } catch (erro) {
        console.error(`Erro ao sincronizar aluno ${alunoSponte.AlunoID}:`, erro);
        totalErros++;
      }
    }

    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "CONCLUIDA",
      totalRecebido: alunos.length,
      totalInserido,
      totalAtualizado,
      totalErros,
      mensagem: `${totalInserido} alunos inseridos, ${totalAtualizado} atualizados`,
    });

    await sponteRepository.criarLogSponte({
      tipo: "ALUNOS",
      status: "SUCESSO",
      mensagem: `Sincronização de alunos concluída: ${totalInserido} inseridos, ${totalAtualizado} atualizados`,
    });

    return { sucesso: true, totalInserido, totalAtualizado, totalErros };
  } catch (erro) {
    console.error("Erro ao sincronizar alunos:", erro);

    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "ERRO",
      mensagem: erro.message,
    });

    await sponteRepository.criarLogSponte({
      tipo: "ALUNOS",
      status: "ERRO",
      mensagem: erro.message,
    });

    throw erro;
  }
}

/**
 * Sincronizar boletins (notas e frequências)
 */
export async function sincronizarBoletins(config) {
  const sync = await sponteRepository.criarSincronizacao({
    entidade: "BOLETINS",
    status: "INICIADA",
  });

  try {
    console.log("[Sponte] Sincronizando boletins...");

    // Buscar turmas para sincronizar boletins
    const resposta = await sponteClient.getTurmas(config, "Situacao=-1");
    const turmas = resposta?.GetTurmasResult || [];

    let totalInserido = 0;
    let totalAtualizado = 0;
    let totalErros = 0;

    for (const turmaSponte of turmas) {
      try {
        // Buscar integrantes da turma
        const integrantesResp = await sponteClient.getIntegrantesTurmas(
          config,
          turmaSponte.TurmaID
        );
        const integrantes = integrantesResp?.GetIntegrantesTurmasResult || [];

        // Buscar turma local
        const mapeamentoTurma = await sponteRepository.buscarMapeamento({
          entidade: "TURMA",
          sponteId: turmaSponte.TurmaID,
        });

        if (!mapeamentoTurma) {
          console.log(`Turma Sponte ${turmaSponte.TurmaID} não mapeada`);
          continue;
        }

        // Para cada aluno da turma, buscar boletim
        for (const integrante of integrantes) {
          try {
            const boletimResp = await sponteClient.getBoletim3(
              config,
              integrante.AlunoID,
              turmaSponte.TurmaID
            );

            if (!boletimResp?.ListaNotasBoletim) continue;

            // Buscar aluno local
            const mapeamentoAluno = await sponteRepository.buscarMapeamento({
              entidade: "ALUNO",
              sponteId: integrante.AlunoID,
            });

            if (!mapeamentoAluno) {
              console.log(`Aluno Sponte ${integrante.AlunoID} não mapeado`);
              continue;
            }

            // Salvar frequência
            if (boletimResp.Frequencia !== undefined || boletimResp.PercentualFrequencia !== undefined) {
              const percentual = boletimResp.PercentualFrequencia || boletimResp.Frequencia || 0;
              const percentualLimpo = String(percentual).replace(",", ".");

              const freqExistente = await pool.query(
                `SELECT * FROM frequencias
                 WHERE aluno_id = $1 AND turma_id = $2 AND bimestre = $3`,
                [mapeamentoAluno.local_id, mapeamentoTurma.local_id, 1]
              );

              if (freqExistente.rows.length > 0) {
                await pool.query(
                  `UPDATE frequencias
                   SET percentual_presenca = $1, atualizado_em = CURRENT_TIMESTAMP
                   WHERE aluno_id = $2 AND turma_id = $3 AND bimestre = $4`,
                  [parseFloat(percentualLimpo), mapeamentoAluno.local_id, mapeamentoTurma.local_id, 1]
                );
                totalAtualizado++;
              } else {
                await pool.query(
                  `INSERT INTO frequencias (aluno_id, turma_id, bimestre, percentual_presenca)
                   VALUES ($1, $2, $3, $4)`,
                  [mapeamentoAluno.local_id, mapeamentoTurma.local_id, 1, parseFloat(percentualLimpo)]
                );
                totalInserido++;
              }
            }

            // Salvar notas por disciplina
            for (const disciplina of boletimResp.ListaNotasBoletim) {
              try {
                // Buscar ou criar disciplina
                let disciplinaLocal = await pool.query(
                  "SELECT * FROM disciplinas WHERE nome = $1",
                  [disciplina.Disciplina]
                );

                let disciplinaId = null;

                if (disciplinaLocal.rows.length > 0) {
                  disciplinaId = disciplinaLocal.rows[0].id;
                } else {
                  const novaDisciplina = await pool.query(
                    "INSERT INTO disciplinas (nome) VALUES ($1) RETURNING *",
                    [disciplina.Disciplina]
                  );
                  disciplinaId = novaDisciplina.rows[0].id;
                }

                // Salvar mapeamento da disciplina
                await sponteRepository.salvarMapeamento({
                  entidade: "DISCIPLINA",
                  sponteId: disciplina.DisciplinaID,
                  localId: disciplinaId,
                });

                // Salvar notas de cada período
                const notas = [
                  { periodo: 1, valor: disciplina.Nota1 },
                  { periodo: 2, valor: disciplina.Nota2 },
                  { periodo: 3, valor: disciplina.Nota3 },
                  { periodo: 4, valor: disciplina.Nota4 },
                ];

                for (const nota of notas) {
                  if (nota.valor === null || nota.valor === undefined || nota.valor === "") {
                    continue;
                  }

                  const valorLimpo = String(nota.valor).replace(",", ".");
                  const notaExistente = await pool.query(
                    `SELECT * FROM notas
                     WHERE aluno_id = $1 AND disciplina_id = $2 AND periodo = $3`,
                    [mapeamentoAluno.local_id, disciplinaId, nota.periodo]
                  );

                  if (notaExistente.rows.length > 0) {
                    await pool.query(
                      `UPDATE notas
                       SET valor = $1, atualizado_em = CURRENT_TIMESTAMP
                       WHERE aluno_id = $2 AND disciplina_id = $3 AND periodo = $4`,
                      [parseFloat(valorLimpo), mapeamentoAluno.local_id, disciplinaId, nota.periodo]
                    );
                  } else {
                    await pool.query(
                      `INSERT INTO notas (aluno_id, disciplina_id, periodo, valor)
                       VALUES ($1, $2, $3, $4)`,
                      [mapeamentoAluno.local_id, disciplinaId, nota.periodo, parseFloat(valorLimpo)]
                    );
                  }
                }
              } catch (erroNota) {
                console.error(`Erro ao sincronizar nota da disciplina ${disciplina.Disciplina}:`, erroNota);
                totalErros++;
              }
            }
          } catch (erroAluno) {
            console.error(`Erro ao sincronizar aluno ${integrante.AlunoID}:`, erroAluno);
            totalErros++;
          }
        }
      } catch (erroTurma) {
        console.error(`Erro ao sincronizar turma ${turmaSponte.TurmaID}:`, erroTurma);
        totalErros++;
      }
    }

    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "CONCLUIDA",
      totalRecebido: 1,
      totalInserido,
      totalAtualizado,
      totalErros,
      mensagem: `${totalInserido} notas/frequências inseridas, ${totalAtualizado} atualizadas`,
    });

    await sponteRepository.criarLogSponte({
      tipo: "BOLETINS",
      status: "SUCESSO",
      mensagem: `Sincronização de boletins concluída`,
    });

    return { sucesso: true, totalInserido, totalAtualizado, totalErros };
  } catch (erro) {
    console.error("Erro ao sincronizar boletins:", erro);

    await sponteRepository.finalizarSincronizacao({
      id: sync.id,
      status: "ERRO",
      mensagem: erro.message,
    });

    await sponteRepository.criarLogSponte({
      tipo: "BOLETINS",
      status: "ERRO",
      mensagem: erro.message,
    });

    throw erro;
  }
}

/**
 * Sincronização completa (turmas, alunos e boletins)
 */
export async function sincronizarCompleta(config) {
  try {
    console.log("[Sponte] Iniciando sincronização completa...");

    const resultados = {
      turmas: await sincronizarTurmas(config),
      alunos: await sincronizarAlunos(config),
      boletins: await sincronizarBoletins(config),
    };

    // Atualizar última sincronização
    const configDB = await pool.query("SELECT id FROM sponte_configuracoes LIMIT 1");
    if (configDB.rows.length > 0) {
      await sponteRepository.atualizarUltimaSincronizacao(configDB.rows[0].id);
    }

    await sponteRepository.criarLogSponte({
      tipo: "SINCRONIZACAO_COMPLETA",
      status: "SUCESSO",
      mensagem: "Sincronização completa finalizada com sucesso",
      detalhes: resultados,
    });

    return resultados;
  } catch (erro) {
    console.error("Erro na sincronização completa:", erro);

    await sponteRepository.criarLogSponte({
      tipo: "SINCRONIZACAO_COMPLETA",
      status: "ERRO",
      mensagem: erro.message,
    });

    throw erro;
  }
}

export default {
  sincronizarTurmas,
  sincronizarAlunos,
  sincronizarBoletins,
  sincronizarCompleta,
};
