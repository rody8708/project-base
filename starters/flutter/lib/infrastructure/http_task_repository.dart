import 'dart:convert';
import 'dart:io';
import '../application/task_repository.dart';
import '../domain/task.dart';

/// HTTP is an adapter only; no server/framework or database types cross the port.
final class HttpTaskRepository implements TaskRepository {
  HttpTaskRepository(String url, {String? Function()? tokenProvider})
    : _tokenProvider = tokenProvider ?? (() => null),
      base = Uri.parse(url) {
    if ((base.scheme != 'https' &&
            !(base.scheme == 'http' &&
                [
                  '127.0.0.1',
                  'localhost',
                  '::1',
                  '10.0.2.2',
                ].contains(base.host))) ||
        base.userInfo.isNotEmpty ||
        base.hasQuery ||
        base.hasFragment ||
        !RegExp(r'/api/v1/?$').hasMatch(base.path)) {
      throw ArgumentError(
        'Use an explicit HTTPS /api/v1 URL or local development loopback.',
      );
    }
  }
  final Uri base;
  final String? Function() _tokenProvider;
  bool _bound = false;
  String? _sessionToken;
  Map<String, Map<String, dynamic>> _snapshots = {};
  static final _id = RegExp(r'^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$');

  Map<String, dynamic> _decode(dynamic value) {
    if (value is! Map<String, dynamic> ||
        value['id'] is! String ||
        (value['id'] as String).length != 36 ||
        !_id.hasMatch(value['id']) ||
        value['title'] is! String ||
        value['completed'] is! bool ||
        value['version'] is! int ||
        value['version'] < 1 ||
        value['version'] > 2147483646) {
      throw const TaskException(TaskIssue.unavailable);
    }
    final title = TaskTitle(value['title']);
    if (title.value != value['title']) {
      throw const TaskException(TaskIssue.unavailable);
    }
    return Map.unmodifiable(value);
  }

  TaskItem _item(Map<String, dynamic> row) => TaskItem(
    id: row['id'],
    title: TaskTitle(row['title']),
    completed: row['completed'],
  );

  Future<dynamic> _request(
    String path,
    String method, [
    Map<String, dynamic>? body,
  ]) async {
    final client = HttpClient()
      ..connectionTimeout = const Duration(seconds: 10);
    try {
      return await (() async {
        final url = Uri.parse(
          '${base.toString().replaceFirst(RegExp(r'/$'), '')}$path',
        );
        final request = await client.openUrl(method, url);
        final token = _tokenProvider();
        if (_bound && token != _sessionToken) {
          _snapshots = {};
          throw const TaskException(TaskIssue.unavailable);
        }
        _bound = true;
        _sessionToken = token;
        if (token != null) {
          if (token.length != 64 ||
              !RegExp(r'^[0-9a-f]{64}$').hasMatch(token)) {
            throw const TaskException(TaskIssue.unavailable);
          }
          request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
        }
        request.followRedirects = false;
        request.headers.set(HttpHeaders.acceptHeader, 'application/json');
        if (body != null) {
          request.headers.contentType = ContentType.json;
          request.write(jsonEncode(body));
        }
        final response = await request.close();
        if (response.statusCode == 404) {
          throw const TaskException(TaskIssue.notFound);
        }
        if (response.statusCode != (method == 'POST' ? 201 : 200) ||
            response.headers.contentType?.mimeType != 'application/json') {
          throw const TaskException(TaskIssue.unavailable);
        }
        final bytes = <int>[];
        await for (final chunk in response) {
          bytes.addAll(chunk);
          if (bytes.length > 1048576) {
            throw const TaskException(TaskIssue.unavailable);
          }
        }
        return jsonDecode(utf8.decode(bytes));
      })().timeout(const Duration(seconds: 10));
    } on TaskException {
      rethrow;
    } catch (_) {
      throw const TaskException(TaskIssue.unavailable);
    } finally {
      client.close(force: true);
    }
  }

  @override
  Future<List<TaskItem>> readAll() async {
    final rows = <String, Map<String, dynamic>>{};
    String? after;
    for (var page = 0; page < 100; page++) {
      final response = await _request(
        '/tasks?limit=100${after == null ? '' : '&after=$after'}',
        'GET',
      );
      if (response is! Map ||
          response['data'] is! List ||
          (response['data'] as List).length > 100) {
        throw const TaskException(TaskIssue.unavailable);
      }
      for (final value in response['data']) {
        final row = _decode(value);
        final id = row['id'] as String;
        if (rows.containsKey(id) ||
            (after != null && id.compareTo(after) <= 0)) {
          throw const TaskException(TaskIssue.unavailable);
        }
        rows[id] = row;
        after = id;
      }
      if ((response['data'] as List).isEmpty) {
        if (!response.containsKey('next_after') ||
            response['next_after'] != null) {
          throw const TaskException(TaskIssue.unavailable);
        }
        _snapshots = rows;
        return List.unmodifiable(rows.values.map(_item));
      }
      if (response['next_after'] != after) {
        throw const TaskException(TaskIssue.unavailable);
      }
    }
    throw const TaskException(TaskIssue.unavailable);
  }

  @override
  Future<TaskItem> add(TaskTitle title) async {
    final row = _decode(
      (await _request('/tasks', 'POST', {'title': title.value}))['data'],
    );
    _snapshots[row['id']] = row;
    return _item(row);
  }

  @override
  Future<TaskItem> setCompleted(String id, bool completed) async {
    final current = _snapshots[id];
    if (current == null) throw const TaskException(TaskIssue.notFound);
    if (current['version'] >= 2147483646) {
      throw const TaskException(TaskIssue.unavailable);
    }
    final row = _decode(
      (await _request('/tasks/$id', 'PUT', {
        'title': current['title'],
        'completed': completed,
        'version': current['version'],
      }))['data'],
    );
    if (row['id'] != id ||
        row['version'] != current['version'] + 1 ||
        row['title'] != current['title'] ||
        row['completed'] != completed) {
      throw const TaskException(TaskIssue.unavailable);
    }
    _snapshots[id] = row;
    return _item(row);
  }
}
