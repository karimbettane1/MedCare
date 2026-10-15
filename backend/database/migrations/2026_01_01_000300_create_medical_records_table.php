<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnUpdate()->cascadeOnDelete();
            $table->unsignedInteger('age')->nullable();
            $table->enum('gender', ['Homme', 'Femme'])->default('Homme');
            $table->string('phone', 20)->nullable();
            $table->text('history')->nullable();
            $table->text('allergies')->nullable();
            $table->text('diagnosis');
            $table->text('treatment')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'created_at']);
            $table->index(['doctor_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
