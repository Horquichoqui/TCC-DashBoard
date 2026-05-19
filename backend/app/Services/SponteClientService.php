<?php

namespace App\Services;

use SoapClient;
use Exception;
use App\Utils\CryptoUtil;

/**
 * Serviço cliente SOAP para integração com API Sponte
 *
 * Responsável por:
 * - Criar conexão SOAP com o Sponte
 * - Chamar métodos SOAP
 * - Retornar dados mock quando configurado
 */
class SponteClientService
{
    private static $client = null;
    private static $lastConfig = null;

    /**
     * Criar cliente SOAP
     */
    private static function createSoapClient(string $wsdlUrl): SoapClient
    {
        $options = [
            'timeout' => 30,
            'connection_timeout' => 30,
            'trace' => true,
            'exceptions' => true,
        ];

        return new SoapClient($wsdlUrl, $options);
    }

    /**
     * Chamar método genérico do Sponte
     */
    public static function callMethod(
        string $methodName,
        array $payload,
        $config
    ): array {
        // Se em modo mock ou sem credenciais, retorna dados fictícios
        if ($config->modo_mock || !$config->codigo_cliente || !$config->token_criptografado) {
            return self::getMockData($methodName, $payload);
        }

        try {
            // Descriptografar token apenas no backend
            $token = CryptoUtil::decrypt($config->token_criptografado);

            // Criar cliente SOAP
            $client = self::createSoapClient($config->endpoint);

            // Montar payload com credenciais
            $payloadComCredenciais = array_merge($payload, [
                'CodigoCliente' => $config->codigo_cliente,
                'Token' => $token,
            ]);

            // Chamar método SOAP
            $result = $client->__soapCall($methodName, [$payloadComCredenciais]);

            return (array) $result;
        } catch (Exception $e) {
            throw new Exception("Erro ao chamar método $methodName do Sponte: " . $e->getMessage());
        }
    }

    /**
     * Retornar dados fictícios baseado no método
     */
    private static function getMockData(string $methodName, array $payload): array
    {
        return match ($methodName) {
            'GetTurmas' => [
                'GetTurmasResult' => self::getMockTurmas(),
            ],
            'GetAlunos' => [
                'GetAlunosResult' => self::getMockAlunos(),
            ],
            'GetIntegrantesTurmas' => [
                'GetIntegrantesTurmasResult' => self::getMockIntegrantes($payload['TurmaID'] ?? 0),
            ],
            'GetBoletim3' => [
                'GetBoletim3Result' => self::getMockBoletim(
                    $payload['AlunoID'] ?? 0,
                    $payload['TurmaID'] ?? 0
                ),
            ],
            default => [],
        };
    }

    /**
     * Dados fictícios de turmas
     */
    private static function getMockTurmas(): array
    {
        return [
            [
                'TurmaID' => 1001,
                'Nome' => '1º Ano A',
                'Sigla' => '1A',
                'Situacao' => 1,
                'Turno' => 'Matutino',
                'CursoID' => 100,
                'Curso' => 'Ensino Fundamental',
                'AnoLetivo' => 2026,
                'DataInicio' => '2026-02-01',
                'DataTermino' => '2026-12-15',
            ],
            [
                'TurmaID' => 1002,
                'Nome' => '1º Ano B',
                'Sigla' => '1B',
                'Situacao' => 1,
                'Turno' => 'Vespertino',
                'CursoID' => 100,
                'Curso' => 'Ensino Fundamental',
                'AnoLetivo' => 2026,
                'DataInicio' => '2026-02-01',
                'DataTermino' => '2026-12-15',
            ],
        ];
    }

    /**
     * Dados fictícios de alunos
     */
    private static function getMockAlunos(): array
    {
        return [
            [
                'AlunoID' => 2001,
                'Nome' => 'Ana Clara Santos',
                'NumeroMatricula' => 'MAT001',
                'RA' => 'RA001',
                'Email' => 'ana.santos@escola.com.br',
                'TurmaAtual' => '1º Ano A',
                'Situacao' => 1,
            ],
            [
                'AlunoID' => 2002,
                'Nome' => 'Bruno Oliveira Costa',
                'NumeroMatricula' => 'MAT002',
                'RA' => 'RA002',
                'Email' => 'bruno.costa@escola.com.br',
                'TurmaAtual' => '1º Ano A',
                'Situacao' => 1,
            ],
            [
                'AlunoID' => 2003,
                'Nome' => 'Camila Ferreira Pereira',
                'NumeroMatricula' => 'MAT003',
                'RA' => 'RA003',
                'Email' => 'camila.pereira@escola.com.br',
                'TurmaAtual' => '1º Ano B',
                'Situacao' => 1,
            ],
        ];
    }

    /**
     * Dados fictícios de integrantes de turma
     */
    private static function getMockIntegrantes(int $turmaId): array
    {
        $todos = [
            ['TurmaID' => 1001, 'AlunoID' => 2001, 'Nome' => 'Ana Clara Santos', 'NumeroChamada' => 1],
            ['TurmaID' => 1001, 'AlunoID' => 2002, 'Nome' => 'Bruno Oliveira Costa', 'NumeroChamada' => 2],
            ['TurmaID' => 1002, 'AlunoID' => 2003, 'Nome' => 'Camila Ferreira Pereira', 'NumeroChamada' => 1],
        ];

        return array_filter($todos, fn($item) => $item['TurmaID'] === $turmaId);
    }

    /**
     * Dados fictícios de boletim
     */
    private static function getMockBoletim(int $alunoId, int $turmaId): array
    {
        if ($alunoId == 2002) {
            // Aluno em risco
            return [
                'AlunoID' => $alunoId,
                'TurmaID' => $turmaId,
                'Frequencia' => 72,
                'ResultadoFinal' => 'Risco',
                'ListaNotasBoletim' => [
                    [
                        'DisciplinaID' => 3001,
                        'Disciplina' => 'Português',
                        'Nota1' => 4.5,
                        'Nota2' => 5.0,
                        'Nota3' => 4.8,
                        'Nota4' => 5.2,
                        'Media' => 4.9,
                        'MediaFinal' => 4.9,
                        'TotalFaltas' => 8,
                        'PercentualFrequencia' => 72,
                        'SituacaoDidatica' => 'Recuperacao',
                    ],
                ],
            ];
        }

        // Aluno regular
        return [
            'AlunoID' => $alunoId,
            'TurmaID' => $turmaId,
            'Frequencia' => 90,
            'ResultadoFinal' => 'Aprovado',
            'ListaNotasBoletim' => [
                [
                    'DisciplinaID' => 3001,
                    'Disciplina' => 'Português',
                    'Nota1' => 8.0,
                    'Nota2' => 8.5,
                    'Nota3' => 8.2,
                    'Nota4' => 8.7,
                    'Media' => 8.35,
                    'MediaFinal' => 8.35,
                    'TotalFaltas' => 2,
                    'PercentualFrequencia' => 90,
                    'SituacaoDidatica' => 'Aprovado',
                ],
            ],
        ];
    }
}
