<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS faltas (
            id BIGSERIAL PRIMARY KEY,
            aluno_id BIGINT NOT NULL,
            data DATE NOT NULL,
            presente BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('faltas');
    }
};
