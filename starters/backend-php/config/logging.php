<?php
declare(strict_types=1);

return [
    'default' => env('LOG_CHANNEL', 'stderr'),
    'channels' => [
        'stderr' => ['driver' => 'monolog', 'handler' => Monolog\Handler\StreamHandler::class,
            'with' => ['stream' => 'php://stderr'], 'level' => env('LOG_LEVEL', 'warning')],
        'null' => ['driver' => 'monolog', 'handler' => Monolog\Handler\NullHandler::class],
    ],
];
