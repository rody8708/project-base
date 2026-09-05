-- SPDX-FileCopyrightText: 2026 Zendrhax LLC
-- SPDX-License-Identifier: MPL-2.0
-- Initial SQLite schema. Rollback: DROP TABLE tasks (destructive; back up first).
CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
    version INTEGER NOT NULL CHECK (version BETWEEN 1 AND 2147483646)
);
CREATE INDEX tasks_owner_id ON tasks(owner_id, id);
