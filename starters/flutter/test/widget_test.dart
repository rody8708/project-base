// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/application/task_repository.dart';
import 'package:foundation_starter/domain/task.dart';
import 'package:foundation_starter/presentation/task_app.dart';

final class FailingRepository implements TaskRepository {
  @override
  Future<List<TaskItem>> readAll() async => throw StateError('private/path');
  @override
  Future<TaskItem> add(TaskTitle title) async =>
      throw StateError('private/path');
  @override
  Future<TaskItem> setCompleted(String id, bool completed) async =>
      throw StateError('private/path');
}

void main() {
  testWidgets('follows the platform dark appearance', (tester) async {
    tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
    addTearDown(
      tester.platformDispatcher.clearPlatformBrightnessTestValue,
    );
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();

    final context = tester.element(find.byType(Scaffold));
    expect(Theme.of(context).brightness, Brightness.dark);
  });

  testWidgets('empty state and session-only warning are visible', (
    tester,
  ) async {
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('empty-state')), findsOneWidget);
    expect(find.textContaining('Los datos se pierden'), findsOneWidget);
  });

  testWidgets('validation, adding, and completing work in Spanish', (
    tester,
  ) async {
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(
      find.text('Escribe un título antes de agregar una tarea.'),
      findsOneWidget,
    );
    await tester.tap(find.text('Cerrar mensaje'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('task-title')), '  Mi tarea  ');
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(find.text('Mi tarea'), findsOneWidget);
    expect(find.byKey(const Key('empty-state')), findsNothing);
    expect(
      tester
          .widget<TextField>(find.byKey(const Key('task-title')))
          .controller!
          .text,
      isEmpty,
    );
    await tester.tap(find.byType(CheckboxListTile));
    await tester.pumpAndSettle();
    expect(
      tester.widget<CheckboxListTile>(find.byType(CheckboxListTile)).value,
      isTrue,
    );
  });

  testWidgets('locale selector updates UI and error messages', (tester) async {
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('locale-picker')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English (United States)').last);
    await tester.pumpAndSettle();
    expect(find.text('Desktop and mobile foundation'), findsOneWidget);
    expect(find.text('No tasks yet. Add your first task.'), findsOneWidget);
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(find.text('Enter a title before adding a task.'), findsOneWidget);
  });

  testWidgets('unexpected adapter failures show no internal diagnostic', (
    tester,
  ) async {
    await tester.pumpWidget(TaskApp(repository: FailingRepository()));
    await tester.pumpAndSettle();
    expect(find.textContaining('No se pudo confirmar'), findsOneWidget);
    expect(find.textContaining('private/path'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('small viewport and keyboard inset remain scrollable', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    tester.view.viewInsets = const FakeViewPadding(bottom: 280);
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetViewInsets);
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    await tester.ensureVisible(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.byKey(const Key('task-error')), findsOneWidget);
  });
}
