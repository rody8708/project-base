// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'dart:convert';
import 'dart:io';

const expectedFlutter = '3.35.1';
const expectedDart = '3.9.0';

List<String> toolchainProblems(
  Map<String, dynamic> version,
  String runningDart,
) {
  final problems = <String>[];
  if (version['frameworkVersion'] != expectedFlutter) {
    problems.add('Flutter must be $expectedFlutter.');
  }
  if (version['dartSdkVersion'] != expectedDart ||
      runningDart.split(' ').first != expectedDart) {
    problems.add('Both Dart runtimes must be $expectedDart.');
  }
  return problems;
}

Future<void> main() async {
  try {
    final result = await Process.run(
      Platform.isWindows ? 'flutter.bat' : 'flutter',
      ['--version', '--machine'],
      runInShell: Platform.isWindows,
    );
    if (result.exitCode != 0) {
      throw StateError('flutter --version failed (${result.exitCode}).');
    }
    final version = jsonDecode(result.stdout as String) as Map<String, dynamic>;
    final problems = toolchainProblems(version, Platform.version);
    if (problems.isNotEmpty) {
      stderr.writeln(problems.join('\n'));
      stderr.writeln(
        'Select the pinned SDK on PATH; this tool installs nothing.',
      );
      exitCode = 1;
      return;
    }
    stdout.writeln('PASS: Flutter $expectedFlutter / Dart $expectedDart.');
  } catch (error) {
    stderr.writeln('Unable to verify the toolchain: $error');
    exitCode = 1;
  }
}
