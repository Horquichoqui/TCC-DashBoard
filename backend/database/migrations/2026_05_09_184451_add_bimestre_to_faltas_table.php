<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();
        $pdo->exec('ALTER TABLE faltas ADD COLUMN IF NOT EXISTS bimestre INTEGER NOT NULL DEFAULT 1');
    }

    public function down(): void
    {
        $pdo = Schema::getConnection()->getPdo();
        $pdo->exec('ALTER TABLE faltas DROP COLUMN IF EXISTS bimestre');
    }
};
