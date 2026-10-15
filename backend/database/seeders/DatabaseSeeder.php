<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'first_name' => 'Test',
                'last_name' => 'User',
                'phone' => '0611111111',
                'gender' => 'male',
                'role' => 'patient',
                'password' => Hash::make('password123'),
            ]
        );

        $doctorUser = User::updateOrCreate(
            ['email' => 'doctor@healthplus.test'],
            [
                'name' => 'Dr Karim Alaoui',
                'first_name' => 'Karim',
                'last_name' => 'Alaoui',
                'phone' => '0612345678',
                'gender' => 'male',
                'role' => 'doctor',
                'password' => Hash::make('password123'),
            ]
        );

        $patientUser = User::updateOrCreate(
            ['email' => 'patient@healthplus.test'],
            [
                'name' => 'Ahmed Benali',
                'first_name' => 'Ahmed',
                'last_name' => 'Benali',
                'phone' => '0623456789',
                'gender' => 'male',
                'role' => 'patient',
                'password' => Hash::make('password123'),
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $doctorUser->id],
            [
                'specialty' => 'Cardiologue',
                'city' => 'Casablanca',
                'photo_path' => 'photo/téléchargement (2).jfif',
                'stars' => 4.8,
                'reviews_count' => 120,
                'bio' => 'Spécialiste cardiaque',
            ]
        );

        $doctorUsers = [
            [
                'name' => 'Dr Salma Idrissi',
                'first_name' => 'Salma',
                'last_name' => 'Idrissi',
                'email' => 'salma.idrissi@healthplus.test',
                'phone' => '0634567890',
                'gender' => 'female',
                'role' => 'doctor',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Dr Youssef Bennani',
                'first_name' => 'Youssef',
                'last_name' => 'Bennani',
                'email' => 'youssef.bennani@healthplus.test',
                'phone' => '0645678901',
                'gender' => 'male',
                'role' => 'doctor',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Dr Lina El Fassi',
                'first_name' => 'Lina',
                'last_name' => 'El Fassi',
                'email' => 'lina.elfassi@healthplus.test',
                'phone' => '0656789012',
                'gender' => 'female',
                'role' => 'doctor',
                'password' => Hash::make('password123'),
            ],
        ];

        $doctorProfiles = [
            [
                'specialty' => 'Dermatologue',
                'city' => 'Rabat',
                'photo_path' => 'photo/téléchargement (3).jfif',
                'stars' => 4.7,
                'reviews_count' => 98,
                'bio' => 'Spécialiste en dermatologie clinique.',
            ],
            [
                'specialty' => 'Pédiatre',
                'city' => 'Marrakech',
                'photo_path' => 'photo/Child specialist here 🙂.jfif',
                'stars' => 4.9,
                'reviews_count' => 143,
                'bio' => 'Pédiatre avec 12 ans d’expérience.',
            ],
            [
                'specialty' => 'Neurologue',
                'city' => 'Tanger',
                'photo_path' => 'photo/téléchargement (4).jfif',
                'stars' => 4.6,
                'reviews_count' => 76,
                'bio' => 'Spécialiste des troubles neurologiques.',
            ],
        ];

        foreach ($doctorUsers as $index => $doctorData) {
            $createdDoctorUser = User::updateOrCreate(
                ['email' => $doctorData['email']],
                $doctorData
            );

            Doctor::updateOrCreate(
                ['user_id' => $createdDoctorUser->id],
                $doctorProfiles[$index]
            );
        }

        PatientProfile::updateOrCreate(
            ['user_id' => $patientUser->id],
            [
                'birth_date' => '1990-01-15',
                'address' => 'Casablanca, Maroc',
                'emergency_contact' => '+330611111111',
            ]
        );

        $appointment = Appointment::firstOrCreate(
            [
                'patient_id' => $patientUser->id,
                'doctor_id' => Doctor::where('user_id', $doctorUser->id)->value('id'),
                'appointment_datetime' => '2026-04-23 09:00:00',
            ],
            [
                'reason' => 'Douleur thoracique',
                'preferred_mode' => 'voice',
                'status' => 'pending',
                'rating' => null,
            ]
        );

        if ($appointment->doctor_id) {
            MedicalRecord::updateOrCreate(
                [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $patientUser->id,
                    'doctor_id' => $appointment->doctor_id,
                ],
                [
                    'age' => 45,
                    'taille' => 175.00,
                    'poids' => 78.50,
                    'gender' => 'Homme',
                    'phone' => '+330600000003',
                    'history' => 'Antécédents familiaux cardiaques',
                    'allergies' => 'Aucune allergie connue',
                    'diagnosis' => 'Suspicion angine de poitrine',
                    'treatment' => 'ECG + bilan sanguin + traitement initial',
                    'price' => 340.00,
                ]
            );
        }
    }
}
