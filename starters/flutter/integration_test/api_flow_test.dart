// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter/material.dart';
import 'package:foundation_starter/infrastructure/http_task_repository.dart';
import 'package:foundation_starter/presentation/task_app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('UI writes through HTTP and reloads persisted data', (
    tester,
  ) async {
    const url = String.fromEnvironment('API_BASE_URL');
    expect(url, isNotEmpty, reason: 'Provide an isolated API_BASE_URL.');
    const tokenFile = String.fromEnvironment('API_TEST_TOKEN_FILE');
    final token =
        jsonDecode(await File(tokenFile).readAsString())['token'] as String;
    await tester.pumpWidget(
      TaskApp(
        repository: HttpTaskRepository(url, tokenProvider: () => token),
        remoteMode: true,
      ),
    );
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('task-title')),
      'Flutter UI HTTP',
    );
    await tester.tap(find.byKey(const Key('add-task')));
    await tester.pumpAndSettle();
    expect(find.text('Flutter UI HTTP'), findsOneWidget);
    await tester.tap(find.byKey(const Key('reload-tasks')));
    await tester.pumpAndSettle();
    expect(find.text('Flutter UI HTTP'), findsOneWidget);
    expect(find.byKey(const Key('task-error')), findsNothing);
  });
}
