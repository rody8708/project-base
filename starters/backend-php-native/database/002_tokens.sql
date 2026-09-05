-- SPDX-FileCopyrightText: 2026 Zendrhax LLC
-- SPDX-License-Identifier: MPL-2.0
-- Rollback: DROP TABLE api_tokens (invalidates all tokens).
CREATE TABLE api_tokens (
    id TEXT PRIMARY KEY NOT NULL,
    subject TEXT NOT NULL,
    permissions TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at + 86400),
    revoked_at INTEGER
);
