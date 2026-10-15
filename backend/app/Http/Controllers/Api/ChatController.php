<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1'],
            'messages.*.role' => ['required', 'string', 'in:system,user,assistant'],
            'messages.*.content' => ['required', 'string'],
            'model' => ['nullable', 'string'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'max_tokens' => ['nullable', 'integer', 'min:1', 'max:4000'],
        ]);

        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            $lastUserMessage = collect($validated['messages'] ?? [])
                ->reverse()
                ->first(fn ($message) => data_get($message, 'role') === 'user');

            $fallbackPrompt = trim((string) data_get($lastUserMessage, 'content', ''));

            return response()->json([
                'message' => 'Mode fallback activé (GROQ_API_KEY absente).',
                'data' => [
                    'reply' => $fallbackPrompt !== ''
                        ? "Assistant local: J’ai bien reçu votre message: \"{$fallbackPrompt}\". Le service IA externe n’est pas configuré pour le moment."
                        : "Assistant local: Le service IA externe n’est pas configuré pour le moment, mais le chat est actif.",
                    'raw_message' => [
                        'role' => 'assistant',
                        'content' => $fallbackPrompt,
                    ],
                    'usage' => null,
                ],
            ], 200);
        }

        $response = Http::withToken($apiKey)
            ->withoutVerifying()
            ->acceptJson()
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $validated['model'] ?? 'openai/gpt-oss-120b',
                'messages' => $validated['messages'],
                'temperature' => $validated['temperature'] ?? 0.01,
                'max_tokens' => $validated['max_tokens'] ?? 1000,
            ]);

        if (!$response->successful()) {
            // Fallback OpenRouter if Groq key/model fails or provider unavailable
            $openRouterKey = env('OPENROUTER_API_KEY');
            if ($openRouterKey) {
                $fallback = Http::withoutVerifying()->withHeaders([
                    'Authorization' => 'Bearer ' . $openRouterKey,
                    'HTTP-Referer' => config('app.url'),
                    'X-Title' => config('app.name', 'Health Plus'),
                ])->acceptJson()->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => 'openai/gpt-3.5-turbo',
                    'messages' => $validated['messages'],
                    'temperature' => $validated['temperature'] ?? 0.2,
                    'max_tokens' => $validated['max_tokens'] ?? 800,
                ]);

                if ($fallback->successful()) {
                    $fallbackData = $fallback->json();
                    $fallbackText = data_get($fallbackData, 'choices.0.message.content');

                    if (is_string($fallbackText) && trim($fallbackText) !== '') {
                        return response()->json([
                            'message' => 'Réponse générée avec succès (fallback).',
                            'data' => [
                                'reply' => trim($fallbackText),
                                'raw_message' => data_get($fallbackData, 'choices.0.message'),
                                'usage' => data_get($fallbackData, 'usage'),
                                'provider' => 'openrouter',
                            ],
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Erreur lors de l’appel au service IA.',
                'details' => $response->json(),
            ], $response->status());
        }

        $data = $response->json();
        $assistantMessage = data_get($data, 'choices.0.message');
        $assistantText = data_get($data, 'choices.0.message.content');

        if (!$assistantMessage || !is_string($assistantText) || trim($assistantText) === '') {
            return response()->json([
                'message' => 'Réponse invalide du service IA.',
                'details' => $data,
            ], 502);
        }

        return response()->json([
            'message' => 'Réponse générée avec succès.',
            'data' => [
                'reply' => trim($assistantText),
                'raw_message' => $assistantMessage,
                'usage' => data_get($data, 'usage'),
                'provider' => 'groq',
            ],
        ]);
    }
}
