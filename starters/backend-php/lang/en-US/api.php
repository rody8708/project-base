<?php
declare(strict_types=1);

return [
    'RATE_LIMITED' => 'Too many requests. Wait before trying again.',
    'UNAUTHENTICATED' => 'A valid access token is required.',
    'FORBIDDEN' => 'This identity does not have the required permission.',
    'NOT_FOUND' => 'The resource was not found.',
    'VERSION_CONFLICT' => 'The resource changed. Read it again before retrying.',
    'VALIDATION_FAILED' => 'The supplied values do not satisfy the contract.',
    'PERSISTENCE_UNAVAILABLE' => 'The storage operation could not be completed.',
    'BAD_REQUEST' => 'A valid JSON object is required.',
    'METHOD_NOT_ALLOWED' => 'This HTTP method is not allowed.',
    'PAYLOAD_TOO_LARGE' => 'The request body is too large.',
    'UNSUPPORTED_MEDIA_TYPE' => 'A JSON content type is required.',
    'HTTP_ERROR' => 'The HTTP request could not be completed.',
    'INTERNAL_ERROR' => 'An internal error occurred.',
];
