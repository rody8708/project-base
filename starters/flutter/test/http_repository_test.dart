// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/domain/task.dart';
import 'package:foundation_starter/infrastructure/http_task_repository.dart';

void main() {
  test(
    'token stays in headers and cannot change within a repository',
    () async {
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      var token = 'a' * 64;
      var calls = 0;
      server.listen((request) async {
        calls++;
        expect(
          request.headers.value(HttpHeaders.authorizationHeader),
          'Bearer $token',
        );
        expect(request.uri.toString().contains(token), isFalse);
        request.response.headers.contentType = ContentType.json;
        request.response.write(jsonEncode({'data': [], 'next_after': null}));
        await request.response.close();
      });
      try {
        final repository = HttpTaskRepository(
          'http://127.0.0.1:${server.port}/api/v1',
          tokenProvider: () => token,
        );
        expect(await repository.readAll(), isEmpty);
        token = 'b' * 64;
        await expectLater(repository.readAll(), throwsA(isA<TaskException>()));
        expect(calls, 1);
      } finally {
        await server.close(force: true);
      }
    },
  );
  test('HTTP adapter refuses insecure nonlocal configuration', () {
    expect(
      () => HttpTaskRepository('http://example.com/api/v1'),
      throwsArgumentError,
    );
  });
  test('malformed response fails without retrying', () async {
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    var calls = 0;
    server.listen((request) async {
      calls++;
      request.response.headers.contentType = ContentType.json;
      request.response.write(
        jsonEncode({
          'data': [
            {'id': 123},
          ],
          'next_after': null,
        }),
      );
      await request.response.close();
    });
    try {
      final repository = HttpTaskRepository(
        'http://127.0.0.1:${server.port}/api/v1',
      );
      await expectLater(repository.readAll(), throwsA(isA<TaskException>()));
      expect(calls, 1);
    } finally {
      await server.close(force: true);
    }
  });
  final url = Platform.environment['FOUNDATION_TEST_API_URL'];
  test(
    'real backend: create, read from another client, conflict, reload',
    () async {
      final token =
          jsonDecode(
                await File(
                  Platform.environment['FOUNDATION_TEST_TOKEN_FILE']!,
                ).readAsString(),
              )['token']
              as String;
      final first = HttpTaskRepository(url!, tokenProvider: () => token);
      final second = HttpTaskRepository(url, tokenProvider: () => token);
      final created = await first.add(TaskTitle('Flutter HTTP 🙂'));
      final observed = await second.readAll();
      expect(observed.any((task) => task.id == created.id), isTrue);
      expect((await first.setCompleted(created.id, true)).completed, isTrue);
      await expectLater(
        second.setCompleted(created.id, false),
        throwsA(isA<TaskException>()),
      );
      expect(
        (await second.readAll())
            .firstWhere((task) => task.id == created.id)
            .completed,
        isTrue,
      );
    },
    skip: url == null
        ? 'Opt-in isolated backend required: FOUNDATION_TEST_API_URL'
        : false,
  );
}
