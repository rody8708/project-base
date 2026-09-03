<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

use App\Http\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'scope' => 'liveness']);
Route::prefix('v1')->middleware(\App\Http\AuthenticateApi::class)->group(function (): void {
    Route::get('/auth/session', function (\App\Application\IdentityContext $identity) {
        $principal = $identity->principal();
        return ['data' => ['subject' => $principal->subject, 'permissions' => $principal->permissions]];
    });
    Route::delete('/auth/token', function (\App\Application\IdentityContext $identity, \App\Application\TokenAuthenticator $tokens) {
        $tokens->revoke($identity->principal()->tokenId);
        return response()->json(null, 204);
    });
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show'])->whereUuid('id');
    Route::put('/tasks/{id}', [TaskController::class, 'update'])->whereUuid('id');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->whereUuid('id');
});
