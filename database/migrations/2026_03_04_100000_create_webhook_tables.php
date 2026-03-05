<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('fingerprint', 64)->unique()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->smallInteger('default_status_code')->default(200);
            $table->string('default_content_type', 100)->default('application/json');
            $table->text('default_response_body')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('webhook_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_endpoint_id')
                ->constrained('webhook_endpoints')
                ->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('method', 10)->index();
            $table->text('url');
            $table->text('query_string')->nullable();
            $table->json('query_params')->nullable();
            $table->json('headers');
            $table->string('content_type', 255)->nullable();
            $table->longText('body')->nullable();
            $table->json('parsed_body')->nullable();
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->unsignedInteger('size')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['webhook_endpoint_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_requests');
        Schema::dropIfExists('webhook_endpoints');
    }
};
