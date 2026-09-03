<?php
declare(strict_types=1);

$base = realpath(dirname(__DIR__));
foreach (['.env', 'database/database.sqlite'] as $relative) {
    if (file_exists($base.'/'.$relative) || is_link($base.'/'.$relative)) {
        fwrite(STDERR, "Local configuration or database already exists; nothing changed.\n"); exit(1);
    }
}
if (is_link($base.'/database') || realpath($base.'/database') !== $base.DIRECTORY_SEPARATOR.'database') {
    fwrite(STDERR, "Use a plain local database directory.\n"); exit(1);
}
$environment = str_replace('APP_KEY=', 'APP_KEY=base64:'.base64_encode(random_bytes(32)), file_get_contents($base.'/.env.example'));
$previousMask = umask(0077);
$status = 0;
try {
    foreach (['.env' => $environment, 'database/database.sqlite' => ''] as $relative => $bytes) {
        $handle = @fopen($base.'/'.$relative, 'x');
        if ($handle === false) { $status = 1; break; }
        $written = fwrite($handle, $bytes);
        $synced = fflush($handle) && fsync($handle);
        fclose($handle);
        if ($written !== strlen($bytes) || !$synced) { $status = 1; break; }
    }
} finally {
    umask($previousMask);
}
if ($status !== 0) {
    fwrite(STDERR, "Creation failed; inspect any retained partial local setup.\n");
} else {
    fwrite(STDOUT, "Created local configuration and an empty SQLite database. Check Windows directory ACLs; run php artisan migrate.\n");
}
exit($status);
