<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS personal_access_tokens (
            id BIGSERIAL PRIMARY KEY,
            tokenable_type VARCHAR(255) NOT NULL,
            tokenable_id BIGINT NOT NULL,
            name TEXT NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            abilities TEXT,
            last_used_at TIMESTAMP,
            expires_at TIMESTAMP,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )');

        $pdo->exec('CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens(tokenable_type, tokenable_id)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS personal_access_tokens_expires_at_index ON personal_access_tokens(expires_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
