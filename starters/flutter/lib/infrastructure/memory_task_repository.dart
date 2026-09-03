import '../application/task_repository.dart';
import '../domain/task.dart';

/// Session-only adapter. No persistence, remote calls, or cross-isolate sharing.
final class MemoryTaskRepository implements TaskRepository {
  final Map<String, TaskItem> _items = {};
  int _nextId = 0;

  @override
  Future<List<TaskItem>> readAll() async => List.unmodifiable(_items.values);

  @override
  Future<TaskItem> add(TaskTitle title) async {
    final item = TaskItem(id: 'task-${++_nextId}', title: title);
    _items[item.id] = item;
    return item;
  }

  @override
  Future<TaskItem> setCompleted(String id, bool completed) async {
    final previous = _items[id];
    if (previous == null) throw const TaskException(TaskIssue.notFound);
    final item = previous.withCompleted(completed);
    _items[id] = item;
    return item;
  }
}
