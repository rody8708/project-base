// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'package:flutter/foundation.dart';

import '../domain/task.dart';
import 'task_repository.dart';

/// Flutter-facing application state; domain and repository contract are pure Dart.
final class TaskController extends ChangeNotifier {
  TaskController(this._repository, {this.onUnexpectedError});

  final TaskRepository _repository;
  final void Function(Object error, StackTrace stack)? onUnexpectedError;
  List<TaskItem> _items = const [];
  bool _busy = false;
  bool _disposed = false;
  TaskIssue? _error;

  List<TaskItem> get items => _items;
  bool get busy => _busy;
  TaskIssue? get error => _error;

  Future<bool> load() => _run(() async {
    final items = await _repository.readAll();
    if (!_disposed) _items = List.unmodifiable(items);
  });

  Future<bool> add(String input) => _run(() async {
    final title = TaskTitle(input);
    final item = await _repository.add(title);
    if (!_disposed) _items = List.unmodifiable([..._items, item]);
  });

  Future<bool> setCompleted(String id, bool completed) => _run(() async {
    final item = await _repository.setCompleted(id, completed);
    if (!_disposed) {
      _items = List.unmodifiable([
        for (final previous in _items)
          if (previous.id == item.id) item else previous,
      ]);
    }
  });

  Future<bool> _run(Future<void> Function() operation) async {
    if (_busy || _disposed) return false;
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      await operation();
      return !_disposed;
    } on TaskException catch (failure) {
      if (!_disposed) _error = failure.issue;
      return false;
    } catch (error, stack) {
      if (!_disposed) _error = TaskIssue.unavailable;
      try {
        onUnexpectedError?.call(error, stack);
      } catch (_) {
        // A failing diagnostic sink must not replace the operation's result.
      }
      return false;
    } finally {
      _busy = false;
      if (!_disposed) notifyListeners();
    }
  }

  void clearError() {
    if (_disposed || _error == null) return;
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
