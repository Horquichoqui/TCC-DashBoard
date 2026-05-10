<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS dias_letivos (
            id BIGSERIAL PRIMARY KEY,
            ano SMALLINT NOT NULL,
            bimestre INTEGER NOT NULL,
            dias INTEGER NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            UNIQUE(ano, bimestre)
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('dias_letivos');
    }
};
