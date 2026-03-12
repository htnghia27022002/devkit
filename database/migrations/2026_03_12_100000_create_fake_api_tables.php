<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fake_api_endpoints', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('fingerprint', 64)->unique()->index();
            $table->string('name', 255)->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->smallInteger('status_code')->default(200);
            $table->string('content_type', 100)->default('application/json');
            $table->text('response_body')->nullable();
            $table->unsignedSmallInteger('delay_ms')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('fake_api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fake_api_endpoint_id')
                ->constrained('fake_api_endpoints')
                ->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('method', 10)->index();
            $table->string('path', 500)->nullable();
            $table->text('query_string')->nullable();
            $table->json('headers');
            $table->longText('body')->nullable();
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['fake_api_endpoint_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fake_api_logs');
        Schema::dropIfExists('fake_api_endpoints');
    }
};
