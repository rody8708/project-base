import '../domain/task.dart';
import 'strings.dart';

final class StringsEnUs implements AppStrings {
  const StringsEnUs();

  @override
  String get appTitle => 'Desktop and mobile foundation';
  @override
  String get language => 'Language';
  @override
  String get example => 'Replaceable example: tasks';
  @override
  String get memoryNotice =>
      'In memory only. Data is lost when the application closes.';
  @override
  String get taskTitle => 'Task title';
  @override
  String get remoteNotice =>
      'API mode. Data is stored by the backend. If a change cannot be confirmed, reload before repeating it.';
  @override
  String get add => 'Add';
  @override
  String get empty => 'No tasks yet. Add your first task.';
  @override
  String get reload => 'Reload';
  @override
  String get dismiss => 'Dismiss message';
  @override
  String error(TaskIssue issue) => switch (issue) {
    TaskIssue.emptyTitle => 'Enter a title before adding a task.',
    TaskIssue.invalidTitle =>
      'Use a single line without control characters in the title.',
    TaskIssue.titleTooLong =>
      'The title exceeds the limit of 80 Unicode code points.',
    TaskIssue.notFound => 'The task is no longer available. Reload the list.',
    TaskIssue.unavailable =>
      'The operation could not be confirmed. Reload before repeating it.',
  };
}
