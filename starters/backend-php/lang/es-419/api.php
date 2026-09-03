<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

return [
    'RATE_LIMITED' => 'Demasiadas solicitudes. Espera antes de volver a intentarlo.',
    'UNAUTHENTICATED' => 'Se requiere un token de acceso válido.',
    'FORBIDDEN' => 'Esta identidad no tiene el permiso requerido.',
    'NOT_FOUND' => 'No se encontró el recurso.',
    'VERSION_CONFLICT' => 'El recurso cambió. Vuelve a consultarlo antes de reintentar.',
    'VALIDATION_FAILED' => 'Los valores proporcionados no cumplen el contrato.',
    'PERSISTENCE_UNAVAILABLE' => 'No se pudo completar la operación de almacenamiento.',
    'BAD_REQUEST' => 'Se requiere un objeto JSON válido.',
    'METHOD_NOT_ALLOWED' => 'Este método HTTP no está permitido.',
    'PAYLOAD_TOO_LARGE' => 'El cuerpo de la solicitud es demasiado grande.',
    'UNSUPPORTED_MEDIA_TYPE' => 'Se requiere un tipo de contenido JSON.',
    'HTTP_ERROR' => 'No se pudo completar la solicitud HTTP.',
    'INTERNAL_ERROR' => 'Ocurrió un error interno.',
];
