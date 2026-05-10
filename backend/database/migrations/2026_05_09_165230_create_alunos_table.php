<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS alunos (
            id BIGSERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            matricula VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255),
            telefone VARCHAR(255),
            turma VARCHAR(255) NOT NULL,
            usuario_id BIGINT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )');

        $pdo->exec('CREATE INDEX IF NOT EXISTS alunos_usuario_id_index ON alunos(usuario_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};
