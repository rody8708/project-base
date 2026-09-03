import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/domain/task.dart';

Matcher hasIssue(TaskIssue issue) =>
    isA<TaskException>().having((failure) => failure.issue, 'issue', issue);

void main() {
  test('title trims surrounding whitespace without changing content', () {
    expect(TaskTitle('  Mañana 😀  ').value, 'Mañana 😀');
  });

  test('empty and whitespace-only titles are rejected', () {
    for (final value in ['', '   ', '\t\n']) {
      expect(() => TaskTitle(value), throwsA(hasIssue(TaskIssue.emptyTitle)));
    }
  });

  test('80 Unicode code points are allowed, 81 are rejected', () {
    expect(TaskTitle('😀' * 80).value.runes.length, 80);
    expect(
      () => TaskTitle('😀' * 81),
      throwsA(hasIssue(TaskIssue.titleTooLong)),
    );
  });

  test('embedded controls and Unicode line separators are rejected', () {
    for (final separator in [
      '\n',
      '\r',
      '\t',
      '\u0000',
      '\u0085',
      '\u2028',
      '\u2029',
    ]) {
      expect(
        () => TaskTitle('a${separator}b'),
        throwsA(hasIssue(TaskIssue.invalidTitle)),
      );
    }
  });

  test('combining marks count as separate code points', () {
    expect(TaskTitle('e\u0301' * 40).value.runes.length, 80);
    expect(
      () => TaskTitle('e\u0301' * 41),
      throwsA(hasIssue(TaskIssue.titleTooLong)),
    );
  });

  test('completion returns a new item and preserves identity/title', () {
    final original = TaskItem(id: 'one', title: TaskTitle('Task'));
    final completed = original.withCompleted(true);
    expect(original.completed, isFalse);
    expect(completed.completed, isTrue);
    expect(completed.id, original.id);
    expect(completed.title, same(original.title));
  });
}
