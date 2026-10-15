<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MedicalRecord::query()->with(['patient', 'doctor.user']);

        if ($request->filled('patient_id')) {
            $query->where('patient_id', (int) $request->input('patient_id'));
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', (int) $request->input('doctor_id'));
        }

        $records = $query
            ->orderByDesc('created_at')
            ->get()
            ->map(function (MedicalRecord $record) {
                return [
                    'id' => $record->id,
                    'appointment_id' => $record->appointment_id,
                    'patient_id' => $record->patient_id,
                    'patient_name' => $record->patient?->name,
                    'doctor_id' => $record->doctor_id,
                    'doctor_name' => $record->doctor?->user?->name,
                    'age' => $record->age,
                    'taille' => $record->taille !== null ? (float) $record->taille : null,
                    'poids' => $record->poids !== null ? (float) $record->poids : null,
                    'gender' => $record->gender,
                    'phone' => $record->phone,
                    'history' => $record->history,
                    'allergies' => $record->allergies,
                    'diagnosis' => $record->diagnosis,
                    'treatment' => $record->treatment,
                    'price' => (float) $record->price,
                    'created_at' => optional($record->created_at)->format('d/m/Y H:i'),
                ];
            });

        return response()->json([
            'data' => $records,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'patient_id' => ['required', 'integer', 'exists:users,id'],
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'age' => ['nullable', 'integer', 'min:0'],
            'taille' => ['nullable', 'numeric', 'min:0'],
            'poids' => ['nullable', 'numeric', 'min:0'],
            'gender' => ['nullable', 'in:Homme,Femme'],
            'phone' => ['nullable', 'string', 'max:20'],
            'history' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'diagnosis' => ['required', 'string'],
            'treatment' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $record = MedicalRecord::create($validated);

        return response()->json([
            'message' => 'Dossier médical créé avec succès.',
            'data' => $record,
        ], 201);
    }

    public function update(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $validated = $request->validate([
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'patient_id' => ['required', 'integer', 'exists:users,id'],
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'age' => ['nullable', 'integer', 'min:0'],
            'taille' => ['nullable', 'numeric', 'min:0'],
            'poids' => ['nullable', 'numeric', 'min:0'],
            'gender' => ['nullable', 'in:Homme,Femme'],
            'phone' => ['nullable', 'string', 'max:20'],
            'history' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'diagnosis' => ['required', 'string'],
            'treatment' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $medicalRecord->fill($validated);
        $medicalRecord->save();

        return response()->json([
            'message' => 'Dossier médical mis à jour avec succès.',
            'data' => $medicalRecord,
        ]);
    }
}
