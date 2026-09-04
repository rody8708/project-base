<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

return [
    'paths' => ['api/v1/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(explode(',', env('API_ALLOWED_ORIGINS', '')))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'Accept-Language', 'Authorization', 'X-Request-Id'],
    'exposed_headers' => ['Location', 'X-Request-Id'],
    'max_age' => 0,
    'supports_credentials' => false,
];
