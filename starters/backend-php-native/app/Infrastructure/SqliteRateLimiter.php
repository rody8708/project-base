<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use App\Application\RateLimiter;
use App\Application\PersistenceUnavailable;
use PDO;

final readonly class SqliteRateLimiter implements RateLimiter
{
    public function __construct(private PDO $database, private \Closure $now, private int $limit = 120)
    {
        if ($limit < 1 || $limit > 10000 || $database->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') throw new \InvalidArgumentException('Invalid limiter configuration.');
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function consume(string $key): int
    {
        $now = ($this->now)();
        $window = intdiv($now, 60) * 60;
        try {
            // A single statement serializes increment and returns the committed count.
            $query = $this->database->prepare('INSERT INTO rate_limits (id, window_start, hits) VALUES (:id, :window, 1)
                ON CONFLICT(id) DO UPDATE SET window_start = excluded.window_start,
                hits = CASE WHEN rate_limits.window_start = excluded.window_start THEN MIN(rate_limits.hits + 1, :ceiling) ELSE 1 END RETURNING hits');
            $query->bindValue(':id', hash('sha256', $key), PDO::PARAM_STR);
            $query->bindValue(':window', $window, PDO::PARAM_INT);
            $query->bindValue(':ceiling', $this->limit + 1, PDO::PARAM_INT);
            $query->execute();
            $hits = (int) $query->fetchColumn();
            $query->closeCursor();
            $cleanup = $this->database->prepare('DELETE FROM rate_limits WHERE window_start < :window');
            $cleanup->execute([':window' => $window]);
            return $hits > $this->limit ? max(1, $window + 60 - $now) : 0;
        } catch (\PDOException $error) { throw new PersistenceUnavailable($error); }
    }
}
