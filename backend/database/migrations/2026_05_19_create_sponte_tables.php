<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabela de configuração do Sponte
        Schema::create('sponte_configuracoes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_cliente')->nullable();
            $table->text('token_criptografado')->nullable();
            $table->string('endpoint')->default('https://api.sponteeducacional.net.br/WSAPIEdu.asmx?WSDL');
            $table->boolean('modo_mock')->default(true);
            $table->boolean('ativo')->default(false);
            $table->timestamp('ultima_sincronizacao')->nullable();
            $table->timestamps();
        });

        // Tabela de logs de sincronização
        Schema::create('sponte_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tipo');
            $table->string('status');
            $table->text('mensagem')->nullable();
            $table->json('detalhes')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->index(['tipo', 'criado_em']);
        });

        // Tabela de controle de sincronizações
        Schema::create('sponte_sincronizacoes', function (Blueprint $table) {
            $table->id();
            $table->string('entidade');
            $table->string('status');
            $table->integer('total_recebido')->default(0);
            $table->integer('total_inserido')->default(0);
            $table->integer('total_atualizado')->default(0);
            $table->integer('total_erros')->default(0);
            $table->text('mensagem')->nullable();
            $table->timestamp('iniciado_em')->useCurrent();
            $table->timestamp('finalizado_em')->nullable();
            $table->index(['entidade', 'iniciado_em']);
        });

        // Tabela de mapeamento entre IDs locais e do Sponte
        Schema::create('sponte_mapeamentos', function (Blueprint $table) {
            $table->id();
            $table->string('entidade');
            $table->string('sponte_id');
            $table->unsignedBigInteger('local_id');
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->useCurrent();
            $table->unique(['entidade', 'sponte_id']);
            $table->index(['entidade']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sponte_mapeamentos');
        Schema::dropIfExists('sponte_sincronizacoes');
        Schema::dropIfExists('sponte_logs');
        Schema::dropIfExists('sponte_configuracoes');
    }
};
