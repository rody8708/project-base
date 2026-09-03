<?php
declare(strict_types=1);

return ['default' => 'database', 'prefix' => 'foundation_', 'stores' => [
    'database' => ['driver' => 'database', 'table' => 'cache', 'lock_table' => 'cache_locks'],
    'array' => ['driver' => 'array', 'serialize' => false],
]];
