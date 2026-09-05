<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

namespace App\Domain;

final readonly class Task
{
    public string $title;

    public static function assertId(string $id): void
    {
        if (!preg_match('/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/D', $id)) {
            throw new TaskValidationFailed('invalid_id');
        }
    }

    public function __construct(
        public string $id,
        string $title,
        public bool $completed = false,
        public int $version = 1,
    ) {
        self::assertId($id);
        if (!mb_check_encoding($title, 'UTF-8')) {
            throw new TaskValidationFailed('invalid_title');
        }
        $normalized = preg_replace('/\A[\p{Z}\s]+|[\p{Z}\s]+\z/u', '', $title);
        if ($normalized === null || $normalized === '' || mb_strlen($normalized, 'UTF-8') > 80
            || preg_match('/[\p{Cc}\p{Zl}\p{Zp}]/u', $normalized)) {
            throw new TaskValidationFailed('invalid_title');
        }
        if ($version < 1 || $version > 2147483646) {
            throw new TaskValidationFailed('invalid_version');
        }
        $this->title = $normalized;
    }

    /** @return array{id: string, title: string, completed: bool, version: int} */
    public function toArray(): array
    {
        return ['id' => $this->id, 'title' => $this->title, 'completed' => $this->completed, 'version' => $this->version];
    }
}
