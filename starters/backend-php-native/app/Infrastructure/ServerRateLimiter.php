<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use App\Application\RateLimiter;
use App\Application\PersistenceUnavailable;
use PDO;

final readonly class ServerRateLimiter implements RateLimiter
{
    public function __construct(private PDO $database, private \Closure $now, private int $limit = 120)
    {
        if (!in_array($database->getAttribute(PDO::ATTR_DRIVER_NAME), ['pgsql', 'mysql'], true) || $limit < 1 || $limit > 10000) throw new \InvalidArgumentException('Invalid SQL limiter.');
    }

    public function consume(string $key): int
    {
        $now = ($this->now)();
        $window = intdiv($now, 60) * 60;
        try {
            $this->database->beginTransaction();
            $sql = $this->database->getAttribute(PDO::ATTR_DRIVER_NAME) === 'pgsql'
                ? 'INSERT INTO rate_limits (id, window_start, hits) VALUES (?, ?, 0) ON CONFLICT (id) DO NOTHING'
                : 'INSERT INTO rate_limits (id, window_start, hits) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE id = id';
            $id = hash('sha256', $key);
            $this->database->prepare($sql)->execute([$id, $window]);
            $query = $this->database->prepare('SELECT window_start, hits FROM rate_limits WHERE id = ? FOR UPDATE');
            $query->execute([$id]);
            $row = $query->fetch(PDO::FETCH_ASSOC);
            $query->closeCursor();
            $hits = (int) $row['window_start'] === $window ? min((int) $row['hits'] + 1, $this->limit + 1) : 1;
            $this->database->prepare('UPDATE rate_limits SET window_start = ?, hits = ? WHERE id = ?')->execute([$window, $hits, $id]);
            $this->database->commit();
            return $hits > $this->limit ? max(1, $window + 60 - $now) : 0;
        } catch (\PDOException $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw new PersistenceUnavailable($error);
        }
    }
}
