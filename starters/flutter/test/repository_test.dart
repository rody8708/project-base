import 'package:flutter_test/flutter_test.dart';
import 'package:foundation_starter/domain/task.dart';
import 'package:foundation_starter/infrastructure/memory_task_repository.dart';

void main() {
  test('new repository is empty and instance state is isolated', () async {
    final first = MemoryTaskRepository();
    await first.add(TaskTitle('one'));
    expect(await MemoryTaskRepository().readAll(), isEmpty);
  });

  test('add assigns unique IDs even when titles are equal', () async {
    final repository = MemoryTaskRepository();
    final first = await repository.add(TaskTitle('one'));
    final second = await repository.add(TaskTitle('one'));
    expect(first.id, isNot(second.id));
    expect(await repository.readAll(), [first, second]);
  });

  test(
    'snapshots are immutable and not changed by subsequent writes',
    () async {
      final repository = MemoryTaskRepository();
      final original = await repository.add(TaskTitle('one'));
      final snapshot = await repository.readAll();
      expect(() => snapshot.clear(), throwsUnsupportedError);
      await repository.setCompleted(original.id, true);
      await repository.add(TaskTitle('two'));
      expect(snapshot.length, 1);
      expect(snapshot.single.completed, isFalse);
    },
  );

  test(
    'setting an explicit completion state twice has same local result',
    () async {
      final repository = MemoryTaskRepository();
      final item = await repository.add(TaskTitle('one'));
      await repository.setCompleted(item.id, true);
      await repository.setCompleted(item.id, true);
      expect((await repository.readAll()).single.completed, isTrue);
      await repository.setCompleted(item.id, false);
      expect((await repository.readAll()).single.completed, isFalse);
    },
  );

  test('unknown IDs fail without adding data', () async {
    final repository = MemoryTaskRepository();
    await expectLater(
      repository.setCompleted('missing', true),
      throwsA(
        isA<TaskException>().having(
          (failure) => failure.issue,
          'issue',
          TaskIssue.notFound,
        ),
      ),
    );
    expect(await repository.readAll(), isEmpty);
  });
}
