<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
require dirname(__DIR__).'/bootstrap.php';

$file = $argv[2] ?? '';
if (!is_file($file)) throw new RuntimeException('Existing synthetic database required.');
$db = new PDO('sqlite:'.$file);
$id = '00000000-0000-4000-8000-000000000009';
$token = getenv('RECOVERY_TEST_TOKEN');
if (!is_string($token) || !preg_match('/\A[0-9a-f]{64}\z/D', $token)) throw new RuntimeException('Synthetic token required.');
if (in_array($argv[1] ?? '', ['seed', 'seed-wal'], true)) {
    if ($argv[1] === 'seed-wal') {
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA wal_autocheckpoint=0');
    }
    $query = $db->prepare('INSERT INTO tasks (id, owner_id, title, completed, version) VALUES (?, ?, ?, ?, ?)');
    $query->execute([$id, 'recovery-owner', 'Recuperación ñ', 1, 4]);
    $store = new App\Infrastructure\SqliteTokenAuthenticator($db, static fn (): int => time());
    $store->insert(hash('sha256', $token), 'recovery-owner', ['tasks:read', 'tasks:write'], time(), time() + 3600);
    if ($argv[1] === 'seed-wal') {
        $db->beginTransaction();
        $query->execute(['00000000-0000-4000-8000-000000000010', 'recovery-owner', 'Uncommitted', 0, 1]);
        echo "READY WAL fixture\n";
        flush();
        fgets(STDIN);
        $db->rollBack();
    }
} elseif (($argv[1] ?? '') === 'assert-restored') {
    $query = $db->prepare('SELECT title, completed, version FROM tasks WHERE id = ? AND owner_id = ?');
    $query->execute([$id, 'recovery-owner']);
    $row = $query->fetch(PDO::FETCH_ASSOC);
    if ($row !== ['title' => 'Recuperación ñ', 'completed' => 1, 'version' => 4]) throw new RuntimeException('Restored data differs.');
    $store = new App\Infrastructure\SqliteTokenAuthenticator($db, static fn (): int => time());
    if ($store->authenticate($token) !== null) throw new RuntimeException('Recovery resurrected credentials.');
    if ($db->query('PRAGMA integrity_check')->fetchColumn() !== 'ok') throw new RuntimeException('Integrity failed.');
    if ((int) $db->query('SELECT COUNT(*) FROM tasks')->fetchColumn() !== 1) throw new RuntimeException('Uncommitted data leaked into recovery.');
} else { throw new RuntimeException('Unknown fixture action.'); }
echo "PASS synthetic recovery fixture\n";
