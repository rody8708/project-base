<?php
declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';
umask(0077);
try {
    $tool = new \App\Infrastructure\BackupEnvelope();
    $result = match (true) {
        $argc === 3 && $argv[1] === 'keygen' => $tool->generateKey($argv[2]),
        $argc === 6 && $argv[1] === 'seal' => $tool->seal($argv[2], $argv[3], $argv[4], $argv[5]),
        $argc === 5 && $argv[1] === 'verify' => $tool->verify($argv[2], $argv[3], $argv[4]),
        $argc === 6 && $argv[1] === 'open' => $tool->open($argv[2], $argv[3], $argv[4], $argv[5]),
        default => throw new RuntimeException('Usage: keygen NEW_KEY | seal SOURCE NEW_ENVELOPE NEW_MANIFEST KEY | verify ENVELOPE MANIFEST KEY | open ENVELOPE MANIFEST NEW_TARGET KEY'),
    };
    echo json_encode($result, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable) {
    fwrite(STDERR, "BACKUP_ENVELOPE_FAILED: output is not approved; quarantine any partial new file.\n"); exit(1);
}
