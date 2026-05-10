<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS notas (
            id BIGSERIAL PRIMARY KEY,
            aluno_id BIGINT NOT NULL,
            disciplina_id BIGINT NOT NULL,
            valor_nota NUMERIC(5, 2) NOT NULL,
            semestre INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
            FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
