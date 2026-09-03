// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/application/task_controller.dart';
import 'package:foundation_starter/application/task_repository.dart';
import 'package:foundation_starter/domain/task.dart';
import 'package:foundation_starter/infrastructure/memory_task_repository.dart';

final class ControlledRepository implements TaskRepository {
  final memory = MemoryTaskRepository();
  Completer<List<TaskItem>>? pendingRead;
  Object? failure;
  int addCalls = 0;
  int readCalls = 0;

  @override
  Future<List<TaskItem>> readAll() async {
    readCalls++;
    if (failure case final failure?) throw failure;
    return pendingRead == null ? memory.readAll() : pendingRead!.future;
  }

  @override
  Future<TaskItem> add(TaskTitle title) async {
    addCalls++;
    if (failure case final failure?) throw failure;
    return memory.add(title);
  }

  @override
  Future<TaskItem> setCompleted(String id, bool completed) async {
    if (failure case final failure?) throw failure;
    return memory.setCompleted(id, completed);
  }
}

void main() {
  test('load/add/complete produces immutable application snapshots', () async {
    final controller = TaskController(MemoryTaskRepository());
    addTearDown(controller.dispose);
    expect(await controller.load(), isTrue);
    expect(controller.items, isEmpty);
    expect(await controller.add(' one '), isTrue);
    expect(controller.items.single.title.value, 'one');
    final snapshot = controller.items;
    expect(() => snapshot.clear(), throwsUnsupportedError);
    expect(await controller.setCompleted(snapshot.single.id, true), isTrue);
    expect(snapshot.single.completed, isFalse);
    expect(controller.items.single.completed, isTrue);
  });

  test('invalid input never reaches repository and can be corrected', () async {
    final repository = ControlledRepository();
    final controller = TaskController(repository);
    addTearDown(controller.dispose);
    expect(await controller.add(' '), isFalse);
    expect(controller.error, TaskIssue.emptyTitle);
    expect(repository.addCalls, 0);
    expect(await controller.add('corrected'), isTrue);
    expect(controller.error, isNull);
  });

  test(
    'unexpected failure preserves current items and exposes generic issue',
    () async {
      final repository = ControlledRepository();
      Object? diagnostic;
      final controller = TaskController(
        repository,
        onUnexpectedError: (error, stack) => diagnostic = error,
      );
      addTearDown(controller.dispose);
      await controller.add('kept');
      repository.failure = StateError('internal diagnostic, not UI text');
      expect(await controller.load(), isFalse);
      expect(controller.items.single.title.value, 'kept');
      expect(controller.error, TaskIssue.unavailable);
      expect(diagnostic, same(repository.failure));
      expect(controller.busy, isFalse);
      controller.clearError();
      expect(controller.error, isNull);
    },
  );

  test('reentry is rejected while an operation is pending', () async {
    final repository = ControlledRepository()
      ..pendingRead = Completer<List<TaskItem>>();
    final controller = TaskController(repository);
    addTearDown(controller.dispose);
    final first = controller.load();
    expect(controller.busy, isTrue);
    expect(await controller.load(), isFalse);
    expect(await controller.add('duplicate click'), isFalse);
    expect(repository.readCalls, 1);
    expect(repository.addCalls, 0);
    repository.pendingRead!.complete([]);
    expect(await first, isTrue);
    expect(controller.busy, isFalse);
  });

  test(
    'a throwing diagnostic sink does not leak an unhandled exception',
    () async {
      final repository = ControlledRepository()
        ..failure = StateError('adapter');
      final controller = TaskController(
        repository,
        onUnexpectedError: (_, _) => throw StateError('diagnostic sink'),
      );
      addTearDown(controller.dispose);
      expect(await controller.load(), isFalse);
      expect(controller.error, TaskIssue.unavailable);
      expect(controller.busy, isFalse);
    },
  );

  test('a write succeeds without a second potentially failing read', () async {
    final repository = ControlledRepository();
    final controller = TaskController(repository);
    addTearDown(controller.dispose);
    expect(await controller.add('committed'), isTrue);
    expect(repository.readCalls, 0);
    expect(repository.addCalls, 1);
  });

  test(
    'expected repository failure does not mutate previous snapshot',
    () async {
      final repository = ControlledRepository();
      final controller = TaskController(repository);
      addTearDown(controller.dispose);
      await controller.add('kept');
      repository.failure = const TaskException(TaskIssue.notFound);
      expect(
        await controller.setCompleted(controller.items.single.id, true),
        isFalse,
      );
      expect(controller.items.single.completed, isFalse);
      expect(controller.error, TaskIssue.notFound);
    },
  );

  test(
    'disposing during a pending operation prevents late notifications',
    () async {
      final repository = ControlledRepository()
        ..pendingRead = Completer<List<TaskItem>>();
      final controller = TaskController(repository);
      var notifications = 0;
      controller.addListener(() => notifications++);
      final pending = controller.load();
      expect(notifications, 1);
      controller.dispose();
      repository.pendingRead!.complete([]);
      expect(await pending, isFalse);
      expect(await controller.add('after disposal'), isFalse);
      expect(repository.addCalls, 0);
      expect(notifications, 1);
    },
  );
}
