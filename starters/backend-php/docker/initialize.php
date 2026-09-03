<?php
declare(strict_types=1);

// This image owns /state; no host database or application .env is mounted.
umask(0077);
function run(array $args): void {
    $process = proc_open($args, [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, '/app');
    if (!is_resource($process) || proc_close($process) !== 0) throw new RuntimeException('Isolated initialization failed.');
}
if (!is_file('/state/app-key')) file_put_contents('/state/app-key', 'base64:'.base64_encode(random_bytes(32)), LOCK_EX);
putenv('APP_KEY='.trim(file_get_contents('/state/app-key')));
if (!is_file('/state/cert.pem')) {
    run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '7',
        '-keyout', '/state/key.pem', '-out', '/state/cert.pem', '-subj', '/CN=foundation.localhost',
        '-addext', 'subjectAltName=DNS:foundation.localhost,DNS:localhost,IP:127.0.0.1']);
}
if (!is_file('/state/database.sqlite')) touch('/state/database.sqlite');
run(['php', 'artisan', 'config:cache']);
run(['php', 'artisan', 'migrate', '--force', '--no-interaction']);
run(['php', 'artisan', 'route:cache']);
run(['php', 'scripts/check-production.php']);
echo "Isolated PHP/HTTPS runtime initialized; local checks passed, production approval pending.\n";
