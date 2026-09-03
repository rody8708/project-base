<?php
declare(strict_types=1);

// Trusted operator CLI, not an HTTP account-registration endpoint.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$operation = $argv[1] ?? '';
if ($operation === 'issue' && count($argv) === 5) {
    $subject = $argv[2];
    $permissions = match ($argv[3]) {
        'reader' => ['tasks:read'], 'editor' => ['tasks:read', 'tasks:write'], default => null,
    };
    $ttl = filter_var($argv[4], FILTER_VALIDATE_INT, ['options' => ['min_range' => 60, 'max_range' => 86400]]);
    if ($permissions === null || $ttl === false || !preg_match('/\A[a-z0-9][a-z0-9-]{0,63}\z/D', $subject)) {
        fwrite(STDERR, "Invalid subject, role, or lifetime (60..86400 seconds).\n"); exit(1);
    }
    $token = bin2hex(random_bytes(32));
    $id = hash('sha256', $token);
    $expires = time() + $ttl;
    $app->make('db')->table('api_tokens')->insert([
        'id' => $id, 'subject' => $subject, 'permissions' => json_encode($permissions, JSON_THROW_ON_ERROR), 'expires_at' => $expires,
    ]);
    // The only plaintext disclosure: deliver privately and never collect this output in logs.
    echo json_encode(['token' => $token, 'token_id' => $id, 'expires_at' => $expires], JSON_THROW_ON_ERROR).PHP_EOL;
} elseif ($operation === 'revoke' && count($argv) === 3 && preg_match('/\A[0-9a-f]{64}\z/D', $argv[2])) {
    $app->make(\App\Application\TokenAuthenticator::class)->revoke($argv[2]);
    echo "Revocation processed.\n";
} else {
    fwrite(STDERR, "Usage: php scripts/token.php issue SUBJECT reader|editor TTL_SECONDS\n       php scripts/token.php revoke TOKEN_ID\n");
    exit(1);
}
