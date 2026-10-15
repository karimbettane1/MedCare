<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Quotas anti-force-brute et anti-abus de quota payant.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by(strtolower((string) $request->input('email', '')).'|'.$request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Trop de tentatives de connexion. Réessayez dans une minute.',
                ], 429));
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(10)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'message' => "Trop d'inscriptions depuis cette adresse. Réessayez plus tard.",
                ], 429));
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower((string) $request->input('email', '')).'|'.$request->ip());
        });

        RateLimiter::for('public', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by((string) ($request->user()?->id ?? $request->ip())));

        // Le proxy IA consomme un quota facturé : 10 requêtes par minute et par utilisateur.
        RateLimiter::for('chat', fn (Request $request) => Limit::perMinute(10)->by((string) ($request->user()?->id ?? $request->ip())));
    }
}
