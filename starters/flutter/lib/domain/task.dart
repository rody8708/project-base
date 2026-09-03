enum TaskIssue { emptyTitle, invalidTitle, titleTooLong, notFound, unavailable }

final class TaskException implements Exception {
  const TaskException(this.issue);

  final TaskIssue issue;
}

final class TaskTitle {
  TaskTitle(String input) : value = input.trim() {
    if (value.isEmpty) throw const TaskException(TaskIssue.emptyTitle);
    if (RegExp(r'[\x00-\x1F\x7F-\x9F\u2028\u2029]').hasMatch(value)) {
      throw const TaskException(TaskIssue.invalidTitle);
    }
    if (value.runes.length > maxCodePoints) {
      throw const TaskException(TaskIssue.titleTooLong);
    }
  }

  // Code points, deliberately not bytes or user-perceived characters.
  static const maxCodePoints = 80;
  final String value;
}

final class TaskItem {
  const TaskItem({
    required this.id,
    required this.title,
    this.completed = false,
  });

  final String id;
  final TaskTitle title;
  final bool completed;

  TaskItem withCompleted(bool value) =>
      TaskItem(id: id, title: title, completed: value);
}
