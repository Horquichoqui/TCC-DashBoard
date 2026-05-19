<?php

namespace App\Services;

use Exception;
use App\Models\Turma;
use App\Models\Aluno;
use App\Models\Disciplina;
use App\Models\Nota;
use App\Models\Frequencia;
use App\Models\SponteConfiguracao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Serviço de sincronização do Sponte
 *
 * Responsável por:
 * 1. Buscar dados do Sponte (real ou mock)
 * 2. Transformar para o formato do dashboard
 * 3. Salvar no banco de dados local
 * 4. Registrar logs e mapeamentos
 */
class SponteSyncService
{
    /**
     * Sincronizar turmas
     */
    public static function syncTurmas(SponteConfiguracao $config): array
    {
        try {
            Log::info('[Sponte] Sincronizando turmas...');

            // Buscar turmas do Sponte
            $resposta = SponteClientService::callMethod(
                'GetTurmas',
                ['ParametrosBusca' => 'Situacao=-1'],
                $config
            );

            $turmas = $resposta['GetTurmasResult'] ?? [];
            if (!is_array($turmas)) {
                $turmas = [$turmas];
            }

            $totalInserido = 0;
            $totalAtualizado = 0;
            $totalErros = 0;

            foreach ($turmas as $turmaSponte) {
                try {
                    // Buscar turma mapeada
                    $mapeamento = DB::table('sponte_mapeamentos')
                        ->where('entidade', 'TURMA')
                        ->where('sponte_id', (string) $turmaSponte['TurmaID'])
                        ->first();

                    if ($mapeamento) {
                        // Atualizar
                        Turma::find($mapeamento->local_id)?->update([
                            'nome' => $turmaSponte['Nome'],
                            'sigla' => $turmaSponte['Sigla'],
                            'turno' => $turmaSponte['Turno'] ?? null,
                        ]);
                        $totalAtualizado++;
                    } else {
                        // Inserir
                        $turma = Turma::create([
                            'nome' => $turmaSponte['Nome'],
                            'sigla' => $turmaSponte['Sigla'],
                            'turno' => $turmaSponte['Turno'] ?? null,
                        ]);

                        // Mapear
                        DB::table('sponte_mapeamentos')->insert([
                            'entidade' => 'TURMA',
                            'sponte_id' => (string) $turmaSponte['TurmaID'],
                            'local_id' => $turma->id,
                            'criado_em' => now(),
                            'atualizado_em' => now(),
                        ]);

                        $totalInserido++;
                    }
                } catch (Exception $e) {
                    Log::error("Erro ao sincronizar turma {$turmaSponte['TurmaID']}: {$e->getMessage()}");
                    $totalErros++;
                }
            }

            // Registrar log
            self::criarLog(
                'TURMAS',
                'SUCESSO',
                "Sincronização concluída: {$totalInserido} inseridas, {$totalAtualizado} atualizadas"
            );

            return [
                'sucesso' => true,
                'totalInserido' => $totalInserido,
                'totalAtualizado' => $totalAtualizado,
                'totalErros' => $totalErros,
            ];
        } catch (Exception $e) {
            Log::error("Erro ao sincronizar turmas: {$e->getMessage()}");
            self::criarLog('TURMAS', 'ERRO', $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sincronizar alunos
     */
    public static function syncAlunos(SponteConfiguracao $config): array
    {
        try {
            Log::info('[Sponte] Sincronizando alunos...');

            // Buscar alunos do Sponte
            $resposta = SponteClientService::callMethod(
                'GetAlunos',
                ['ParametrosBusca' => 'SituacaoAlunoID=-1'],
                $config
            );

            $alunos = $resposta['GetAlunosResult'] ?? [];
            if (!is_array($alunos)) {
                $alunos = [$alunos];
            }

            $totalInserido = 0;
            $totalAtualizado = 0;
            $totalErros = 0;

            foreach ($alunos as $alunoSponte) {
                try {
                    // Buscar turma
                    $turmaId = null;
                    if ($alunoSponte['TurmaAtual'] ?? null) {
                        $turma = Turma::where('nome', $alunoSponte['TurmaAtual'])->first();
                        $turmaId = $turma?->id;
                    }

                    // Verificar se aluno existe
                    $alunoExistente = Aluno::where(
                        'numero_matricula',
                        $alunoSponte['NumeroMatricula']
                    )->first();

                    if ($alunoExistente) {
                        // Atualizar
                        $alunoExistente->update([
                            'nome' => $alunoSponte['Nome'],
                            'email' => $alunoSponte['Email'] ?? null,
                            'turma_id' => $turmaId,
                        ]);
                        $alunoLocal = $alunoExistente;
                        $totalAtualizado++;
                    } else {
                        // Inserir
                        $alunoLocal = Aluno::create([
                            'nome' => $alunoSponte['Nome'],
                            'numero_matricula' => $alunoSponte['NumeroMatricula'],
                            'email' => $alunoSponte['Email'] ?? null,
                            'turma_id' => $turmaId,
                        ]);
                        $totalInserido++;
                    }

                    // Mapear
                    DB::table('sponte_mapeamentos')->updateOrInsert(
                        [
                            'entidade' => 'ALUNO',
                            'sponte_id' => (string) $alunoSponte['AlunoID'],
                        ],
                        [
                            'local_id' => $alunoLocal->id,
                            'atualizado_em' => now(),
                        ]
                    );
                } catch (Exception $e) {
                    Log::error("Erro ao sincronizar aluno {$alunoSponte['AlunoID']}: {$e->getMessage()}");
                    $totalErros++;
                }
            }

            self::criarLog(
                'ALUNOS',
                'SUCESSO',
                "Sincronização concluída: {$totalInserido} inseridos, {$totalAtualizado} atualizados"
            );

            return [
                'sucesso' => true,
                'totalInserido' => $totalInserido,
                'totalAtualizado' => $totalAtualizado,
                'totalErros' => $totalErros,
            ];
        } catch (Exception $e) {
            Log::error("Erro ao sincronizar alunos: {$e->getMessage()}");
            self::criarLog('ALUNOS', 'ERRO', $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sincronizar boletins (notas e frequências)
     */
    public static function syncBoletins(SponteConfiguracao $config): array
    {
        try {
            Log::info('[Sponte] Sincronizando boletins...');

            // Buscar turmas
            $resposta = SponteClientService::callMethod(
                'GetTurmas',
                ['ParametrosBusca' => 'Situacao=-1'],
                $config
            );

            $turmas = $resposta['GetTurmasResult'] ?? [];
            if (!is_array($turmas)) {
                $turmas = [$turmas];
            }

            $totalInserido = 0;
            $totalAtualizado = 0;
            $totalErros = 0;

            foreach ($turmas as $turmaSponte) {
                try {
                    // Buscar integrantes
                    $integrantesResp = SponteClientService::callMethod(
                        'GetIntegrantesTurmas',
                        ['TurmaID' => $turmaSponte['TurmaID']],
                        $config
                    );

                    $integrantes = $integrantesResp['GetIntegrantesTurmasResult'] ?? [];
                    if (!is_array($integrantes)) {
                        $integrantes = [$integrantes];
                    }

                    // Buscar turma local
                    $mapeamentoTurma = DB::table('sponte_mapeamentos')
                        ->where('entidade', 'TURMA')
                        ->where('sponte_id', (string) $turmaSponte['TurmaID'])
                        ->first();

                    if (!$mapeamentoTurma) {
                        continue;
                    }

                    // Para cada aluno da turma
                    foreach ($integrantes as $integrante) {
                        try {
                            // Buscar boletim
                            $boletimResp = SponteClientService::callMethod(
                                'GetBoletim3',
                                [
                                    'AlunoID' => $integrante['AlunoID'] ?? 0,
                                    'TurmaID' => $turmaSponte['TurmaID'] ?? 0,
                                    'DisciplinaID' => 0,
                                    'Modulo' => 0,
                                ],
                                $config
                            );

                            if (empty($boletimResp['ListaNotasBoletim'] ?? [])) {
                                continue;
                            }

                            // Buscar aluno local
                            $mapeamentoAluno = DB::table('sponte_mapeamentos')
                                ->where('entidade', 'ALUNO')
                                ->where('sponte_id', (string) $integrante['AlunoID'])
                                ->first();

                            if (!$mapeamentoAluno) {
                                continue;
                            }

                            // Salvar frequência
                            $percentual = $boletimResp['PercentualFrequencia'] ??
                                $boletimResp['Frequencia'] ?? 0;
                            $percentual = str_replace(',', '.', $percentual);

                            $freqExistente = Frequencia::where('aluno_id', $mapeamentoAluno->local_id)
                                ->where('turma_id', $mapeamentoTurma->local_id)
                                ->where('bimestre', 1)
                                ->first();

                            if ($freqExistente) {
                                $freqExistente->update(['percentual_presenca' => (float) $percentual]);
                                $totalAtualizado++;
                            } else {
                                Frequencia::create([
                                    'aluno_id' => $mapeamentoAluno->local_id,
                                    'turma_id' => $mapeamentoTurma->local_id,
                                    'bimestre' => 1,
                                    'percentual_presenca' => (float) $percentual,
                                ]);
                                $totalInserido++;
                            }

                            // Salvar notas
                            foreach ($boletimResp['ListaNotasBoletim'] ?? [] as $disciplina) {
                                try {
                                    // Buscar ou criar disciplina
                                    $disc = Disciplina::where('nome', $disciplina['Disciplina'])->first();

                                    if (!$disc) {
                                        $disc = Disciplina::create(['nome' => $disciplina['Disciplina']]);
                                    }

                                    // Mapear disciplina
                                    DB::table('sponte_mapeamentos')->updateOrInsert(
                                        [
                                            'entidade' => 'DISCIPLINA',
                                            'sponte_id' => (string) $disciplina['DisciplinaID'],
                                        ],
                                        [
                                            'local_id' => $disc->id,
                                            'atualizado_em' => now(),
                                        ]
                                    );

                                    // Salvar notas por período
                                    for ($periodo = 1; $periodo <= 4; $periodo++) {
                                        $notaKey = "Nota{$periodo}";
                                        $valor = $disciplina[$notaKey] ?? null;

                                        if ($valor === null || $valor === '' || $valor === 0) {
                                            continue;
                                        }

                                        $valor = (float) str_replace(',', '.', $valor);

                                        $notaExistente = Nota::where('aluno_id', $mapeamentoAluno->local_id)
                                            ->where('disciplina_id', $disc->id)
                                            ->where('periodo', $periodo)
                                            ->first();

                                        if ($notaExistente) {
                                            $notaExistente->update(['valor' => $valor]);
                                        } else {
                                            Nota::create([
                                                'aluno_id' => $mapeamentoAluno->local_id,
                                                'disciplina_id' => $disc->id,
                                                'periodo' => $periodo,
                                                'valor' => $valor,
                                            ]);
                                        }
                                    }
                                } catch (Exception $e) {
                                    Log::error("Erro ao sincronizar nota: {$e->getMessage()}");
                                    $totalErros++;
                                }
                            }
                        } catch (Exception $e) {
                            Log::error("Erro ao sincronizar aluno {$integrante['AlunoID']}: {$e->getMessage()}");
                            $totalErros++;
                        }
                    }
                } catch (Exception $e) {
                    Log::error("Erro ao sincronizar turma {$turmaSponte['TurmaID']}: {$e->getMessage()}");
                    $totalErros++;
                }
            }

            self::criarLog('BOLETINS', 'SUCESSO', 'Sincronização de boletins concluída');

            return [
                'sucesso' => true,
                'totalInserido' => $totalInserido,
                'totalAtualizado' => $totalAtualizado,
                'totalErros' => $totalErros,
            ];
        } catch (Exception $e) {
            Log::error("Erro ao sincronizar boletins: {$e->getMessage()}");
            self::criarLog('BOLETINS', 'ERRO', $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sincronização completa
     */
    public static function syncCompleta(SponteConfiguracao $config): array
    {
        try {
            Log::info('[Sponte] Iniciando sincronização completa...');

            $resultados = [
                'turmas' => self::syncTurmas($config),
                'alunos' => self::syncAlunos($config),
                'boletins' => self::syncBoletins($config),
            ];

            // Atualizar última sincronização
            $config->update(['ultima_sincronizacao' => now()]);

            self::criarLog('SINCRONIZACAO_COMPLETA', 'SUCESSO', 'Sincronização concluída com sucesso');

            return $resultados;
        } catch (Exception $e) {
            Log::error("Erro na sincronização completa: {$e->getMessage()}");
            self::criarLog('SINCRONIZACAO_COMPLETA', 'ERRO', $e->getMessage());
            throw $e;
        }
    }

    /**
     * Criar log
     */
    private static function criarLog(string $tipo, string $status, string $mensagem): void
    {
        DB::table('sponte_logs')->insert([
            'tipo' => $tipo,
            'status' => $status,
            'mensagem' => $mensagem,
            'criado_em' => now(),
        ]);
    }
}
