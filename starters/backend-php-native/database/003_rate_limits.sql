-- SPDX-FileCopyrightText: 2026 Zendrhax LLC
-- SPDX-License-Identifier: MPL-2.0
-- Rollback: DROP TABLE rate_limits (resets throttling history).
CREATE TABLE rate_limits (
    id TEXT PRIMARY KEY NOT NULL,
    window_start INTEGER NOT NULL,
    hits INTEGER NOT NULL CHECK (hits > 0)
);
CREATE INDEX rate_limits_window ON rate_limits(window_start);
