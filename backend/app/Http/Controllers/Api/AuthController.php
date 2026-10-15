<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:72'],
            'phone' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', 'in:male,female,private'],
            'role' => ['nullable', 'in:patient,doctor'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $role = $validated['role'] ?? 'patient';
        $nameParts = explode(' ', $validated['name'], 2);

        $user = User::create([
            'name' => $validated['name'],
            'first_name' => $nameParts[0] ?? '',
            'last_name' => $nameParts[1] ?? '',
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? 'private',
            'role' => $role,
            'password' => Hash::make($validated['password']),
        ]);

        // Create patient profile automatically for patients
        if ($role === 'patient') {
            PatientProfile::create([
                'user_id' => $user->id,
            ]);
        }

        // Create doctor profile for doctors
        if ($role === 'doctor') {
            $photoPath = null;

            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('doctor-photos', 'public');
            }

            Doctor::create([
                'user_id' => $user->id,
                'specialty' => $validated['specialty'] ?? 'Médecin Généraliste',
                'city' => $validated['city'] ?? 'Non renseignée',
                'photo_path' => $photoPath,
                'stars' => 0,
                'reviews_count' => 0,
                'bio' => $validated['bio'] ?? '',
            ]);

            // Keep address from doctor signup inside patient profile table for now (shared profile store)
            if (!empty($validated['address'])) {
                PatientProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    ['address' => $validated['address']]
                );
            }
        }

        $responseData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
            'token' => $user->createToken('medcare')->plainTextToken,
        ];

        // Include doctor_id if doctor
        if ($role === 'doctor') {
            $doctor = $user->doctorProfile;
            $responseData['doctor_id'] = $doctor?->id;
        }

        return response()->json([
            'message' => 'Inscription réussie.',
            'data' => $responseData,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Message unique : une réponse différenciée révélerait les emails existants.
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        $role = $user->role ?? ($user->doctorProfile ? 'doctor' : 'patient');

        $responseData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'gender' => $user->gender,
            'role' => $role,
            'token' => $user->createToken('medcare')->plainTextToken,
        ];

        // Include doctor_id if the user is a doctor
        if ($role === 'doctor') {
            $doctor = $user->doctorProfile;
            $responseData['doctor_id'] = $doctor?->id;
        }

        return response()->json([
            'message' => 'Connexion réussie.',
            'data' => $responseData,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // For security, always return the same message whether the user exists or not
        $message = 'Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.';

        if ($user) {
            // Delete any existing tokens for this email
            DB::table('password_resets')->where('email', $validated['email'])->delete();

            // Generate a unique token
            $token = Str::random(60);

            // Store the token in the database
            DB::table('password_resets')->insert([
                'email' => $validated['email'],
                'token' => hash('sha256', $token),
                'used' => 0,
                'created_at' => now(),
                'expires_at' => now()->addHour(),
            ]);

            // In a production app, send an email with the reset link:
            // $resetLink = "http://localhost:3000/Health-Plus/reset-password?token={$token}&email=" . urlencode($validated['email']);
            // Mail::to($user)->send(new ResetPasswordMail($resetLink));
        }

        return response()->json([
            'message' => $message,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ]);

        // Find the token in the database
        $resetRecord = DB::table('password_resets')
            ->where('email', $validated['email'])
            ->where('token', hash('sha256', $validated['token']))
            ->where('used', 0)
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Lien de réinitialisation invalide ou expiré.',
            ], 400);
        }

        // Find the user and update password
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable.',
            ], 404);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        // Mark the token as used
        DB::table('password_resets')
            ->where('id', $resetRecord->id)
            ->update(['used' => 1]);

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    /**
     * Révoque le jeton utilisé par la requête courante.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Get the currently logged-in user's profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['doctorProfile', 'patientProfile']);

        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'gender' => $user->gender,
            'role' => $user->role,
            'created_at' => optional($user->created_at)->format('d/m/Y'),
        ];

        if ($user->role === 'doctor' && $user->doctorProfile) {
            $data['doctor'] = [
                'id' => $user->doctorProfile->id,
                'specialty' => $user->doctorProfile->specialty,
                'city' => $user->doctorProfile->city,
                'bio' => $user->doctorProfile->bio,
                'photo_path' => $user->doctorProfile->photo_path,
                'photo_url' => $user->doctorProfile->photo_path
                    ? asset('storage/' . $user->doctorProfile->photo_path)
                    : null,
                'stars' => $user->doctorProfile->stars,
                'reviews_count' => $user->doctorProfile->reviews_count,
            ];
        }

        if ($user->role === 'patient' && $user->patientProfile) {
            $data['patient_profile'] = [
                'birth_date' => $user->patientProfile->birth_date,
                'address' => $user->patientProfile->address,
                'emergency_contact' => $user->patientProfile->emergency_contact,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Update the user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        if (isset($validated['first_name']) || isset($validated['last_name'])) {
            $firstName = $validated['first_name'] ?? $user->first_name;
            $lastName = $validated['last_name'] ?? $user->last_name;
            $user->first_name = $firstName;
            $user->last_name = $lastName;
            $user->name = trim("$firstName $lastName");
        }

        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }
}
