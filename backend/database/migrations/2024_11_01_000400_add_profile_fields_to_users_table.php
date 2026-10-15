<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Legacy migration intentionally kept as no-op.
     * The valid implementation exists in:
     * 2026_01_01_000400_add_profile_fields_to_users_table.php
     */
    public function up(): void
    {
        // no-op (avoids duplicate column creation)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // no-op
    }
};
