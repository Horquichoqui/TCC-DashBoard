<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS professor_alunos (
            id BIGSERIAL PRIMARY KEY,
            professor_id BIGINT NOT NULL,
            aluno_id BIGINT NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            UNIQUE(professor_id, aluno_id),
            FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('professor_alunos');
    }
};
