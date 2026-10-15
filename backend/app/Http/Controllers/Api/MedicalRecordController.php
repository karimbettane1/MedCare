<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    /**
     * Identifiant du profil médecin connecté (null si l'utilisateur n'est pas médecin).
     */
    private function currentDoctorId(Request $request): ?int
    {
        $user = $request->user();

        return $user->role === 'doctor' ? $user->doctorProfile?->id : null;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $doctorId = $this->currentDoctorId($request);

        $query = MedicalRecord::query()->with(['patient', 'doctor.user']);

        // Un médecin ne voit que les dossiers qu'il a rédigés ; un patient ne voit que les siens.
        if ($user->role === 'doctor') {
            $query->where('doctor_id', $doctorId ?? 0);
        } else {
            $query->where('patient_id', $user->id);
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
        $doctorId = $this->currentDoctorId($request);

        if (! $doctorId) {
            return response()->json([
                'message' => 'Seuls les médecins peuvent créer un dossier médical.',
            ], 403);
        }

        $validated = $request->validate([
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'patient_id' => ['required', 'integer', 'exists:users,id'],
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

        if (! User::where('id', $validated['patient_id'])->where('role', 'patient')->exists()) {
            return response()->json([
                'message' => "Le dossier ne peut concerner qu'un patient.",
            ], 422);
        }

        $record = MedicalRecord::create([
            ...$validated,
            'doctor_id' => $doctorId,
        ]);

        return response()->json([
            'message' => 'Dossier médical créé avec succès.',
            'data' => $record,
        ], 201);
    }

    public function update(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $doctorId = $this->currentDoctorId($request);

        // Ni la réattribution du dossier, ni la lecture chez un confrère ne sont autorisées.
        if (! $doctorId || (int) $medicalRecord->doctor_id !== $doctorId) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier ce dossier médical.',
            ], 403);
        }

        $validated = $request->validate([
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
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
