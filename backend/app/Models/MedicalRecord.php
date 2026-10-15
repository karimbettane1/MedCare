<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'age',
        'taille',
        'poids',
        'gender',
        'phone',
        'history',
        'allergies',
        'diagnosis',
        'treatment',
        'price',
    ];

    protected $casts = [
        'age' => 'integer',
        'taille' => 'decimal:2',
        'poids' => 'decimal:2',
        'price' => 'decimal:2',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
