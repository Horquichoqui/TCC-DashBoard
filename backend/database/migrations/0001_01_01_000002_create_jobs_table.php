<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $pdo = Schema::getConnection()->getPdo();

        $pdo->exec('CREATE TABLE IF NOT EXISTS jobs (
            id BIGSERIAL PRIMARY KEY,
            queue VARCHAR(255) NOT NULL,
            payload TEXT NOT NULL,
            attempts SMALLINT NOT NULL,
            reserved_at INTEGER,
            available_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        )');

        $pdo->exec('CREATE INDEX IF NOT EXISTS jobs_queue_index ON jobs(queue)');

        $pdo->exec('CREATE TABLE IF NOT EXISTS job_batches (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            total_jobs INTEGER NOT NULL,
            pending_jobs INTEGER NOT NULL,
            failed_jobs INTEGER NOT NULL,
            failed_job_ids TEXT NOT NULL,
            options TEXT,
            cancelled_at INTEGER,
            created_at INTEGER NOT NULL,
            finished_at INTEGER
        )');

        $pdo->exec('CREATE TABLE IF NOT EXISTS failed_jobs (
            id BIGSERIAL PRIMARY KEY,
            uuid VARCHAR(255) NOT NULL UNIQUE,
            connection TEXT NOT NULL,
            queue TEXT NOT NULL,
            payload TEXT NOT NULL,
            exception TEXT NOT NULL,
            failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};
