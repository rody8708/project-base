-- SPDX-FileCopyrightText: 2026 Zendrhax LLC
-- SPDX-License-Identifier: MPL-2.0
-- Initial pgsql schema. Rollback is destructive: restore a verified backup instead.
-- MySQL DDL is not transactional. Replay is idempotent after an interrupted initial migration.
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    title VARCHAR(320) NOT NULL,
    completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
    version INTEGER NOT NULL CHECK (version BETWEEN 1 AND 2147483646)
);
CREATE INDEX IF NOT EXISTS tasks_owner_id ON tasks(owner_id, id);
CREATE TABLE IF NOT EXISTS api_tokens (
    id VARCHAR(64) PRIMARY KEY,
    subject VARCHAR(64) NOT NULL,
    permissions TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    revoked_at BIGINT NULL,
    CHECK (expires_at > created_at AND expires_at - created_at <= 86400)
);
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(64) PRIMARY KEY,
    window_start BIGINT NOT NULL,
    hits INTEGER NOT NULL CHECK (hits >= 0)
);
