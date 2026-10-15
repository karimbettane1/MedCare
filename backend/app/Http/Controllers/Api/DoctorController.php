<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Doctor::query()->with('user');

        if ($request->filled('city') && $request->string('city')->toString() !== 'all') {
            $query->where('city', $request->string('city')->toString());
        }

        if ($request->filled('specialty') && $request->string('specialty')->toString() !== 'all') {
            $query->where('specialty', $request->string('specialty')->toString());
        }

        $doctors = $query->get()->map(function (Doctor $doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->user?->name,
                'email' => $doctor->user?->email,
                'specialty' => $doctor->specialty,
                'city' => $doctor->city,
                'stars' => $doctor->stars,
                'reviews' => $doctor->reviews_count,
                'bio' => $doctor->bio,
                'photo_path' => $doctor->photo_path,
                'photo_url' => $doctor->photo_path ? url('/storage/' . ltrim($doctor->photo_path, '/')) : null,
            ];
        });

        return response()->json([
            'data' => $doctors,
        ]);
    }

    public function rate(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json([
                'message' => 'Seuls les patients peuvent évaluer un médecin.',
            ], 403);
        }

        // Une évaluation par consultation : sans cela, n'importe qui peut gonfler les étoiles.
        $consultation = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $user->id)
            ->whereIn('status', ['accepted', 'completed'])
            ->whereNull('rating')
            ->latest('appointment_datetime')
            ->first();

        if (! $consultation) {
            return response()->json([
                'message' => "Vous ne pouvez évaluer ce médecin qu'après une consultation, et une fois par consultation.",
            ], 403);
        }

        $consultation->update(['rating' => (int) $validated['rating']]);

        $currentReviews = (int) $doctor->reviews_count;
        $currentStars = (float) $doctor->stars;

        $newReviews = $currentReviews + 1;
        $newAverage = (($currentStars * $currentReviews) + (int) $validated['rating']) / $newReviews;

        $doctor->update([
            'reviews_count' => $newReviews,
            'stars' => round($newAverage, 1),
        ]);

        return response()->json([
            'message' => 'Évaluation du médecin enregistrée avec succès.',
            'data' => [
                'doctor_id' => $doctor->id,
                'rating' => (int) $validated['rating'],
                'doctor_stars' => $doctor->fresh()?->stars,
                'doctor_reviews_count' => $doctor->fresh()?->reviews_count,
            ],
        ]);
    }
}
