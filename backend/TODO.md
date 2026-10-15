# TODO - Correction complète Frontend / Backend / API / DB

- [x] Corriger la migration dupliquée `add_profile_fields_to_users_table` (legacy 2024 no-op)
- [x] Vérifier migration/seed et ajout de doctors
- [x] Corriger la base API frontend vers backend Laravel local
- [x] Renforcer définitivement `Health-Plus/src/api.js` (URL API + gestion stricte des réponses JSON)
- [x] Vérifier et corriger `Health-Plus/src/Pages/inscription.js` mapping payload backend
- [x] Vérifier et corriger `Health-Plus/src/Pages/Login.js` mapping payload backend
- [x] Vérifier format JSON des erreurs API Laravel pour toutes routes `/api/*` (422/401/404/400: JSON OK)
- [x] Tester endpoints auth (register/login/profile/update) en happy path + error path (15/10/2026)
- [x] Tester endpoints appointments et medical-records (happy path + validations, 15/10/2026)
- [x] Vérifier persistance DB réelle après inscription/connexion (user + patient_profile créés, login relit la DB)
- [x] Valider flux complet frontend: inscription -> connexion -> données stockées DB
- [x] Durcir la sécurité API: Sanctum Bearer + logout, routes protégées, contrôle d'accès par rôle (anti-IDOR), rate limiting, CORS restreint, en-têtes de sécurité, erreurs d'auth génériques, clés IA via `config('services')`
- [x] Matrice de tests sécurité 30 vérifications (OK=30) sur `artisan serve`
