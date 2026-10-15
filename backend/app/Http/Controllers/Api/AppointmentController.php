<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    private const SLOT_START_MINUTES = 8 * 60 + 30; // 08:30

    private const SLOT_END_MINUTES = 16 * 60; // 16:00 (heure de fermeture)

    private const SLOT_DURATION_MINUTES = 30;

    private const BLOCKING_STATUSES = ['pending', 'accepted'];

    /**
     * Génère les créneaux de 30 min entre 08:30 et 16:00 (un RDV ne doit pas dépasser 16:00).
     *
     * @return array<int, string> ex: ["08:30", "09:00", ...]
     */
    private function generateSlots(): array
    {
        $slots = [];
        for ($m = self::SLOT_START_MINUTES; $m + self::SLOT_DURATION_MINUTES <= self::SLOT_END_MINUTES; $m += self::SLOT_DURATION_MINUTES) {
            $slots[] = sprintf('%02d:%02d', intdiv($m, 60), $m % 60);
        }

        return $slots;
    }

    /**
     * Créneaux disponibles pour un médecin à une date donnée.
     */
    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $date = Carbon::parse($validated['date'])->startOfDay();
        $now = Carbon::now();

        if ($date->lt($now->copy()->startOfDay())) {
            return response()->json([
                'message' => 'La date sélectionnée est dans le passé.',
            ], 422);
        }

        $blockedTimes = Appointment::query()
            ->where('doctor_id', $validated['doctor_id'])
            ->whereDate('appointment_datetime', $date->toDateString())
            ->whereIn('status', self::BLOCKING_STATUSES)
            ->pluck('appointment_datetime')
            ->map(fn ($dt) => $dt->format('H:i'))
            ->all();

        $isToday = $date->toDateString() === $now->toDateString();

        $available = array_values(array_filter(
            $this->generateSlots(),
            function (string $slot) use ($blockedTimes, $isToday, $date, $now) {
                if (in_array($slot, $blockedTimes, true)) {
                    return false;
                }

                if ($isToday && $date->copy()->setTimeFromTimeString($slot)->lte($now)) {
                    return false;
                }

                return true;
            }
        ));

        return response()->json([
            'data' => [
                'date' => $date->toDateString(),
                'slots' => $available,
            ],
        ]);
    }
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Appointment::query()->with(['patient', 'doctor.user']);

        // Un patient ne voit que ses rendez-vous, un médecin que ceux qui lui sont adressés.
        if ($user->role === 'doctor') {
            $query->where('doctor_id', $user->doctorProfile?->id ?? 0);
        } else {
            $query->where('patient_id', $user->id);
        }

        if ($request->filled('status') && $request->string('status')->toString() !== 'all') {
            $query->where('status', $request->string('status')->toString());
        }

        $appointments = $query
            ->orderByDesc('appointment_datetime')
            ->get()
            ->map(function (Appointment $appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'patient_name' => $appointment->patient?->name,
                    'doctor_id' => $appointment->doctor_id,
                    'doctor_name' => $appointment->doctor?->user?->name,
                    'appointment_datetime' => optional($appointment->appointment_datetime)->format('Y-m-d H:i:s'),
                    'reason' => $appointment->reason,
                    'preferred_mode' => $appointment->preferred_mode,
                    'status' => $appointment->status,
                    'rating' => $appointment->rating,
                ];
            });

        return response()->json([
            'data' => $appointments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json([
                'message' => 'Seuls les patients peuvent prendre un rendez-vous.',
            ], 403);
        }

        $validated = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'appointment_datetime' => ['required', 'date_format:Y-m-d H:i:s'],
            'reason' => ['nullable', 'string', 'max:255'],
            'preferred_mode' => ['required', 'in:voice,video'],
        ]);

        $slotDateTime = Carbon::parse($validated['appointment_datetime']);
        $now = Carbon::now();

        if (!in_array($slotDateTime->format('H:i'), $this->generateSlots(), true)) {
            return response()->json([
                'message' => 'Le créneau doit durer 30 minutes et se situer entre 08:30 et 16:00.',
            ], 422);
        }

        if ($slotDateTime->lte($now)) {
            return response()->json([
                'message' => 'Veuillez sélectionner un créneau futur.',
            ], 422);
        }

        // Transaction + verrouillage de la ligne (ou du gap) pour empêcher
        // deux patients de réserver simultanément le même créneau chez le même médecin.
        $conflict = DB::transaction(function () use ($validated, $slotDateTime, $user) {
            $alreadyBooked = Appointment::query()
                ->where('doctor_id', $validated['doctor_id'])
                ->where('appointment_datetime', $slotDateTime)
                ->whereIn('status', self::BLOCKING_STATUSES)
                ->lockForUpdate()
                ->exists();

            if ($alreadyBooked) {
                return true;
            }

            Appointment::create([
                ...$validated,
                'patient_id' => $user->id,
                'appointment_datetime' => $slotDateTime->toDateTimeString(),
                'status' => 'pending',
            ]);

            return false;
        });

        if ($conflict) {
            return response()->json([
                'message' => "Cette heure vient d'être réservée. Veuillez choisir une autre heure.",
            ], 409);
        }

        $appointment = Appointment::query()
            ->where('doctor_id', $validated['doctor_id'])
            ->where('appointment_datetime', $slotDateTime)
            ->latest('id')
            ->firstOrFail();

        return response()->json([
            'message' => 'Votre rendez-vous a été enregistré avec succès.',
            'data' => $appointment,
        ], 201);
    }

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,accepted,rejected,completed,cancelled'],
        ]);

        $user = $request->user();
        $isAssignedDoctor = $user->role === 'doctor'
            && (int) $user->doctorProfile?->id === (int) $appointment->doctor_id;
        $isConcernedPatient = (int) $user->id === (int) $appointment->patient_id;

        // Le médecin assigné gère le rendez-vous ; le patient peut seulement l'annuler.
        if (! $isAssignedDoctor && ! ($isConcernedPatient && $validated['status'] === 'cancelled')) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier ce rendez-vous.',
            ], 403);
        }

        $appointment->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Statut du rendez-vous mis à jour.',
            'data' => $appointment,
        ]);
    }

    public function rate(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        if ((int) $appointment->patient_id !== (int) $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas noter ce rendez-vous.',
            ], 403);
        }

        if ($appointment->status !== 'completed') {
            return response()->json([
                'message' => 'Seuls les rendez-vous terminés peuvent être notés.',
            ], 422);
        }

        if (!is_null($appointment->rating)) {
            return response()->json([
                'message' => 'Ce rendez-vous a déjà été noté.',
            ], 422);
        }

        $appointment->update([
            'rating' => $validated['rating'],
        ]);

        $doctor = $appointment->doctor;

        if (!$doctor) {
            return response()->json([
                'message' => 'Médecin introuvable pour ce rendez-vous.',
            ], 404);
        }

        $ratedAppointments = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereNotNull('rating');

        $reviewsCount = (int) $ratedAppointments->count();
        $averageRating = (float) $ratedAppointments->avg('rating');

        $doctor->update([
            'reviews_count' => $reviewsCount,
            'stars' => $reviewsCount > 0 ? round($averageRating, 1) : 0,
        ]);

        $freshDoctor = $doctor->fresh();

        return response()->json([
            'message' => 'Évaluation enregistrée avec succès.',
            'data' => [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id,
                'rating' => $appointment->rating,
                'doctor_stars' => $freshDoctor?->stars,
                'doctor_reviews_count' => $freshDoctor?->reviews_count,
            ],
        ]);
    }
}
