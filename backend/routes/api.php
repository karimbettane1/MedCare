<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Accès public : création de compte, authentification et annuaire des médecins.
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:reset-password');
    Route::get('/doctors', [DoctorController::class, 'index'])->middleware('throttle:public');

    // Tout le reste exige un jeton Sanctum : l'identité vient du jeton, jamais du client.
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        // Profile
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/profile', [AuthController::class, 'profile']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Doctors
        Route::patch('/doctors/{doctor}/rate', [DoctorController::class, 'rate']);

        // Appointments
        Route::get('/appointments/availability', [AppointmentController::class, 'availability']);
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
        Route::patch('/appointments/{appointment}/rate', [AppointmentController::class, 'rate']);

        // Medical Records
        Route::get('/medical-records', [MedicalRecordController::class, 'index']);
        Route::post('/medical-records', [MedicalRecordController::class, 'store']);
        Route::patch('/medical-records/{medicalRecord}', [MedicalRecordController::class, 'update']);

        // Chat (Groq proxy)
        Route::post('/chat', [ChatController::class, 'chat'])->middleware('throttle:chat');
    });
});
