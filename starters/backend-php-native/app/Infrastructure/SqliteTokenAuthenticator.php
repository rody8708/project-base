<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);
namespace App\Infrastructure;

use App\Application\Principal;
use App\Application\TokenAuthenticator;
use App\Application\PersistenceUnavailable;
use App\Application\TokenStore;
use PDO;

final readonly class SqliteTokenAuthenticator implements TokenAuthenticator, TokenStore
{
    public function __construct(private PDO $database, private \Closure $now)
    {
        if ($database->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') throw new \InvalidArgumentException('SQLite required.');
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function authenticate(string $token): ?Principal
    {
        if (!preg_match('/\A[0-9a-f]{64}\z/D', $token)) return null;
        try {
            $query = $this->database->prepare('SELECT subject, permissions FROM api_tokens WHERE id = :id AND revoked_at IS NULL AND expires_at > :now');
            $query->execute([':id' => hash('sha256', $token), ':now' => ($this->now)()]);
            $row = $query->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $error) { throw new PersistenceUnavailable($error); }
        if ($row === false) return null;
        try {
            $permissions = json_decode($row['permissions'], true, 8, JSON_THROW_ON_ERROR);
            if (!is_array($permissions) || !array_is_list($permissions)) return null;
            foreach ($permissions as $permission) if (!is_string($permission)) return null;
            return new Principal($row['subject'], $permissions, hash('sha256', $token));
        } catch (\JsonException | \InvalidArgumentException) { return null; }
    }

    public function revoke(string $tokenId): void
    {
        try {
            $query = $this->database->prepare('UPDATE api_tokens SET revoked_at = :now WHERE id = :id');
            $query->execute([':id' => $tokenId, ':now' => ($this->now)()]);
        } catch (\PDOException $error) { throw new PersistenceUnavailable($error); }
    }

    public function insert(string $id, string $subject, array $permissions, int $createdAt, int $expiresAt): void
    {
        try {
            $query = $this->database->prepare('INSERT INTO api_tokens (id, subject, permissions, created_at, expires_at) VALUES (?, ?, ?, ?, ?)');
            $query->execute([$id, $subject, json_encode($permissions, JSON_THROW_ON_ERROR), $createdAt, $expiresAt]);
        } catch (\PDOException $error) { throw new PersistenceUnavailable($error); }
    }
}
