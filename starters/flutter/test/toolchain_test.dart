// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'package:flutter_test/flutter_test.dart';

import '../tool/check_toolchain.dart';

void main() {
  test('the reference Flutter and Dart versions pass the preflight', () {
    expect(
      toolchainProblems({
        'frameworkVersion': '3.35.1',
        'dartSdkVersion': '3.9.0',
      }, '3.9.0 (stable) on windows_x64'),
      isEmpty,
    );
  });

  test('different Flutter or Dart versions are explicitly rejected', () {
    expect(
      toolchainProblems({
        'frameworkVersion': '3.35.2',
        'dartSdkVersion': '3.9.0',
      }, '3.9.0'),
      ['Flutter must be 3.35.1.'],
    );
    expect(
      toolchainProblems({
        'frameworkVersion': '3.35.1',
        'dartSdkVersion': '3.9.1',
      }, '3.9.0'),
      ['Both Dart runtimes must be 3.9.0.'],
    );
    expect(
      toolchainProblems({
        'frameworkVersion': '3.35.1',
        'dartSdkVersion': '3.9.0',
      }, '3.9.1'),
      ['Both Dart runtimes must be 3.9.0.'],
    );
  });

  test('missing version metadata fails closed', () {
    expect(toolchainProblems({}, 'unknown').length, 2);
  });
}
