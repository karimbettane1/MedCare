<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Le disque du projet (Ventoy, non-NTFS) ne supporte pas les liens symboliques :
// `storage:link` est impossible, donc /storage est servi par cette route.
Route::get('/storage/{path}', function (string $path) {
    $base = realpath(storage_path('app/public'));
    $file = $base !== false ? realpath($base.DIRECTORY_SEPARATOR.$path) : false;

    if ($base === false || $file === false || !str_starts_with($file, $base.DIRECTORY_SEPARATOR) || !is_file($file)) {
        abort(404);
    }

    return response()->file($file);
})->where('path', '.*');
