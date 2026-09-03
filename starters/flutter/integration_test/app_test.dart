import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/presentation/task_app.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('native task flow, validation, and locale change', (
    tester,
  ) async {
    await tester.pumpWidget(const TaskApp());
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('empty-state')), findsOneWidget);
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(
      find.text('Escribe un título antes de agregar una tarea.'),
      findsOneWidget,
    );
    await tester.tap(find.text('Cerrar mensaje'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('task-title')),
      'Integration task',
    );
    // Hide the native keyboard so subsequent controls are reachable on mobile.
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.byKey(const Key('add-task')));
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(find.text('Integration task'), findsOneWidget);
    await tester.ensureVisible(find.byType(CheckboxListTile));
    await tester.tap(find.byType(CheckboxListTile));
    await tester.pumpAndSettle();
    expect(
      tester.widget<CheckboxListTile>(find.byType(CheckboxListTile)).value,
      isTrue,
    );
    await tester.ensureVisible(find.byKey(const Key('locale-picker')));
    await tester.tap(find.byKey(const Key('locale-picker')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English (United States)').last);
    await tester.pumpAndSettle();
    expect(find.text('Desktop and mobile foundation'), findsOneWidget);
    expect(find.text('Integration task'), findsOneWidget);
  });
}
