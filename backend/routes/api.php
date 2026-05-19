<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\FaltaController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\DiaLetivoController;
use App\Http\Controllers\SponteController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('alunos', AlunoController::class);
    Route::apiResource('notas', NotaController::class);
    Route::apiResource('faltas', FaltaController::class);
    Route::apiResource('disciplinas', DisciplinaController::class);
    Route::apiResource('dias-letivos', DiaLetivoController::class);

    Route::get('/faltas/presenca/{alunoId}/{bimestre}', [FaltaController::class, 'presencaAluno']);
    Route::get('/relatorio/alunos-em-risco', [FaltaController::class, 'alunosEmRisco']);

    // Rotas de integração Sponte
    Route::prefix('sponte')->group(function () {
        Route::get('/status', [SponteController::class, 'getStatus']);
        Route::post('/configuracao', [SponteController::class, 'saveConfig']);
        Route::post('/testar-conexao', [SponteController::class, 'testConnection']);
        Route::post('/sincronizar/turmas', [SponteController::class, 'syncTurmas']);
        Route::post('/sincronizar/alunos', [SponteController::class, 'syncAlunos']);
        Route::post('/sincronizar/boletins', [SponteController::class, 'syncBoletins']);
        Route::post('/sincronizar/completa', [SponteController::class, 'syncCompleta']);
        Route::get('/logs', [SponteController::class, 'getLogs']);
    });
});

