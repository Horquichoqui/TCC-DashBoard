<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\SponteConfiguracao;
use App\Services\SponteClientService;
use App\Services\SponteSyncService;
use App\Utils\CryptoUtil;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Controller para integração com Sponte
 *
 * Responsável por:
 * - Obter status da integração
 * - Salvar credenciais
 * - Testar conexão
 * - Sincronizar dados
 * - Listar logs
 */
class SponteController extends Controller
{
    /**
     * Obter status da integração
     */
    public function getStatus(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'configurado' => false,
                        'modo' => 'demonstracao',
                        'ultimaSincronizacao' => null,
                        'endpoint' => 'https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL',
                        'tokenConfigurado' => false,
                        'aviso' => 'Enquanto as credenciais reais não forem informadas, o sistema usa dados fictícios para demonstração.',
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'configurado' => $config->ativo && $config->codigo_cliente,
                    'modo' => $config->modo_mock ? 'demonstracao' : 'real',
                    'ultimaSincronizacao' => $config->ultima_sincronizacao,
                    'endpoint' => $config->endpoint,
                    'tokenConfigurado' => !!$config->token_criptografado,
                    'aviso' => $config->modo_mock
                        ? 'Modo de demonstração ativo. O sistema usa dados fictícios.'
                        : 'Modo real ativo. O sistema sincroniza com o Sponte.',
                ],
            ]);
        } catch (Exception $e) {
            Log::error("Erro ao obter status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Salvar configuração (CodigoCliente e Token)
     */
    public function saveConfig(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'codigoCliente' => 'required|string',
                'token' => 'required|string',
                'modoMock' => 'boolean',
            ]);

            // Criptografar token
            $tokenCriptografado = CryptoUtil::encrypt($request->token);

            // Salvar ou atualizar
            $config = SponteConfiguracao::latest()->first() ?? new SponteConfiguracao();
            $config->fill([
                'codigo_cliente' => $request->codigoCliente,
                'token_criptografado' => $tokenCriptografado,
                'modo_mock' => $request->modoMock ?? true,
                'ativo' => true,
                'endpoint' => 'https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL',
            ])->save();

            // Log
            DB::table('sponte_logs')->insert([
                'tipo' => 'CONFIGURACAO',
                'status' => 'SUCESSO',
                'mensagem' => 'Configuração salva com sucesso',
                'criado_em' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Configuração salva com sucesso',
                'data' => [
                    'configurado' => true,
                    'modo' => $config->modo_mock ? 'demonstracao' : 'real',
                ],
            ]);
        } catch (Exception $e) {
            Log::error("Erro ao salvar configuração: {$e->getMessage()}");

            DB::table('sponte_logs')->insert([
                'tipo' => 'CONFIGURACAO',
                'status' => 'ERRO',
                'mensagem' => $e->getMessage(),
                'criado_em' => now(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar configuração',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Testar conexão
     */
    public function testConnection(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config?->codigo_cliente || !$config?->token_criptografado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Configuração não encontrada',
                ], 400);
            }

            // Tentar chamar um método
            SponteClientService::callMethod(
                'GetTurmas',
                ['ParametrosBusca' => 'Situacao=-1;limit=1'],
                $config
            );

            DB::table('sponte_logs')->insert([
                'tipo' => 'TESTE_CONEXAO',
                'status' => 'SUCESSO',
                'mensagem' => 'Conexão testada com sucesso',
                'criado_em' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conexão com Sponte testada com sucesso',
                'data' => ['conexao' => 'ok'],
            ]);
        } catch (Exception $e) {
            Log::error("Erro ao testar conexão: {$e->getMessage()}");

            DB::table('sponte_logs')->insert([
                'tipo' => 'TESTE_CONEXAO',
                'status' => 'ERRO',
                'mensagem' => $e->getMessage(),
                'criado_em' => now(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao conectar com o Sponte',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronizar turmas
     */
    public function syncTurmas(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sponte não configurado',
                ], 400);
            }

            $resultado = SponteSyncService::syncTurmas($config);

            return response()->json([
                'success' => true,
                'message' => 'Sincronização de turmas concluída',
                'data' => $resultado,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao sincronizar turmas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronizar alunos
     */
    public function syncAlunos(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sponte não configurado',
                ], 400);
            }

            $resultado = SponteSyncService::syncAlunos($config);

            return response()->json([
                'success' => true,
                'message' => 'Sincronização de alunos concluída',
                'data' => $resultado,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao sincronizar alunos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronizar boletins
     */
    public function syncBoletins(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sponte não configurado',
                ], 400);
            }

            $resultado = SponteSyncService::syncBoletins($config);

            return response()->json([
                'success' => true,
                'message' => 'Sincronização de boletins concluída',
                'data' => $resultado,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao sincronizar boletins',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincronização completa
     */
    public function syncCompleta(): JsonResponse
    {
        try {
            $config = SponteConfiguracao::latest()->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sponte não configurado',
                ], 400);
            }

            $resultado = SponteSyncService::syncCompleta($config);

            return response()->json([
                'success' => true,
                'message' => 'Sincronização completa concluída',
                'data' => $resultado,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro na sincronização',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar logs
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $limite = $request->query('limite', 50);

            $logs = DB::table('sponte_logs')
                ->orderBy('criado_em', 'desc')
                ->limit($limite)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $logs,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
