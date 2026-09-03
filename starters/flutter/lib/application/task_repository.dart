// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import '../domain/task.dart';

/// Repository implementations own unique IDs and return immutable snapshots.
/// A successful write returns its committed item, not a second read operation.
/// Remote adapters use the shared API contract and cached versions. An unavailable
/// write has an unconfirmed outcome: reload before repeating, never auto-retry.
abstract interface class TaskRepository {
  Future<List<TaskItem>> readAll();
  Future<TaskItem> add(TaskTitle title);
  Future<TaskItem> setCompleted(String id, bool completed);
}
