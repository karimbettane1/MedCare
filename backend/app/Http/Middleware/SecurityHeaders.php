<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * En-têtes de durcissement pour toutes les réponses (API et fichiers du disque public).
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->is('api/*')) {
            // Les réponses contiennent des données de santé : rien ne doit être mis en cache.
            $response->headers->set('Cache-Control', 'no-store, max-age=0');
        }

        return $response;
    }
}
