<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('api_tokens', function (Blueprint $table): void {
            $table->char('id', 64)->primary();
            $table->string('subject', 64)->index();
            $table->text('permissions');
            $table->bigInteger('expires_at');
            $table->bigInteger('revoked_at')->nullable();
        });
        Schema::table('tasks', function (Blueprint $table): void {
            // Existing rows remain unassigned and invisible until an operator reviews ownership.
            $table->string('owner_id', 64)->nullable();
            $table->index(['owner_id', 'id']);
        });
    }
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropIndex(['owner_id', 'id']);
            $table->dropColumn('owner_id');
        });
        Schema::dropIfExists('api_tokens');
    }
};
